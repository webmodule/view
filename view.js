define({
    name: "view",
    modules: ["jsutils.file", "jQuery", "lazy", "pitana"]
}).as(function (VIEW, fileUtil, jq, lazy, pitana) {

    var TAG_NAME = "tag-view", ANI_REMOVING = "view-ani-removing", ANI_ADDING = "view-ani-adding";
    var VIEWS = {}, viewCounter = 0;
    var __$trash__;


    /**
     * Description
     * @method bindDomEvents
     * @param {View} THIS
     * @param {} events
     * @return
     */
    var bindDomEvents = function (THIS, events) {
        //We use {"eventName hash":"handler"} kind of notation !
        THIS.__eventsMap__ = THIS.__eventsMap__ || {};
        pitana.util.for(events, function (methodName, key) {
            key = key.trim().replace(/ +/g, " ");
            var arr = key.split(" ");
            var eventName = arr.shift();
            var hash = arr.join(" ");
            var callback = pitana.domEvents.addLiveEventListener(THIS.$$[0], eventName, hash, THIS[methodName], THIS);
            THIS.__eventsMap__[key] = {
                eventName: eventName,
                callback: callback
            };
        });
    };

    /**
     * Description
     * @method unBindDomEvents
     * @param {} THIS
     * @return
     */
    var unBindDomEvents = function (THIS) {
        for (var key in THIS.__eventsMap__) {
            var v = THIS.__eventsMap__[key];
            if (v !== undefined && typeof v === "object") {
                THIS.$$[0].removeEventListener(v.eventName, v.callback);
                delete THIS.__eventsMap__[key];
            }
        }
    };

    var create = function (THIS, options) {
        THIS.__uuid__ = window.getUUID();
        VIEWS[THIS.__uuid__] = THIS;
        var moduleName = (THIS.name).replace(/\./g, "-");
        var moduuleId = options.id || ("view-" + viewCounter++ );
        var $me = options.$$ || jq('<' + TAG_NAME + '>');
        return jq($me).attr(moduleName, "").attr({
            id: moduuleId,
            __uuid__: THIS.__uuid__
        });
    };

    var init = function ($context, THIS, options) {
        THIS.$$ = create(THIS, options);
        $context.append(THIS.$$.addClass(ANI_ADDING));
        var $parent = $context.closest(TAG_NAME);
        bindDomEvents(THIS, THIS.events);
        if ($parent.length > 0) {
            var __uuid__ = $parent.attr("__uuid__");
            var parentVIEW = VIEWS[__uuid__];
            parentVIEW.___child___ = parentVIEW.___child___ || {};
            parentVIEW.___child___[THIS.__uuid__] = THIS.__uuid__;
        }
        return lazy.promise(THIS._init_(options))().done(function () {
            THIS.$$.removeClass(ANI_ADDING);
        });
    };

    return {
        $: function () {
            if (arguments.length == 0) {
                return this.$$;
            }
            return this.$$.find.apply(this.arguments);
        },
        endView: function () {
            var self = this;
            if (this._end_) {
                this._end_();
            }
            for (var uid in self.___child___) {
                self.___child___[uid].endView();
                delete self.___child___[uid];
            }
            unBindDomEvents(self);
            if (self.$$) {
                try {
                    self.$$.addClass(ANI_REMOVING);
                    self.$$.detach();
                    __$trash__.append(self.$$);
                    window.setTimeout(function () {
                        self.$$.remove();
                    }, 5000);
                } catch (e) {
                    console.warn("ViewDetachException:", e)
                }
            }
            delete VIEWS[self.__uuid__];
        },
        _ready_: function () {
            jq.fn.initView = function (mod, options) {
                var $context = jq(this);
                if (mod.is("view")) {
                    return init($context, mod, options || {});
                } else {
                    return lazy.promise($context.append(mod));
                }
            };
            jq.fn.endView = function () {
                var $view = jq(this);
                if ($view[0].tagName == TAG_NAME && VIEWS[$view[0].id]) {
                    VIEWS[$view[0].id].end();
                } else {
                    $view.remove();
                }
            };
            __$trash__ = jq("<view-trash hidden style='display:none'>");
            jq("body").append(__$trash__);
            console.info("----view is ready-----");
        }
    };

});
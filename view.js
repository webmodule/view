define({
    name: "view",
    modules: ["jsutils.file", "jQuery", "lazy"]
}).as(function (VIEW, fileUtil, jq, lazy) {

    var TAG_NAME = "view", ANI_REMOVING = "view-ani-removing", ANI_ADDING = "view-ani-adding";
    var VIEWS = {};
    var __$trash__;

    return {
        $: function () {
            this.$$ = this.$$ || jq('<tag-view>');
            if (arguments.length == 0) {
                return this.$$;
            }
            return this.$$.find.apply(this.arguments);
        },
        __init__: function () {
            this.__uuid__ = window.getUUID();
            VIEWS[this.__uuid__] = this;
            var $parent = this.$().attr("__uuid__",this.__uuid__).parent().closest("tag-view");
            if ($parent.length > 0) {
                var __uuid__ = $parent.attr("__uuid__");
                var parentVIEW = VIEWS[__uuid__];
                parentVIEW.___child___ = parentVIEW.___child___ || {};
                parentVIEW.___child___[this.__uuid__] = this.__uuid__;
            }
            return this._init_();
        },
        end: function () {
            var self = this;
            for (var uid in self.___child___) {
                self.___child___[uid].end();
            }
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
            jq.fn.addView = function (mod, options) {
                var $context = jq(this);
                if (mod.is("view")) {
                    $context.addClass(ANI_ADDING).append(mod.$());
                    return lazy.promise(mod.__init__(options))().done(function () {
                        $context.removeClass(ANI_ADDING);
                    });
                } else {
                    return lazy.promise($context.append(mod));
                }
            };
            jq.fn.endView = function () {
                var $view = jq(this);
                if ($view[0].tagName == 'tag-view' && VIEWS[$view[0].id]) {
                    VIEWS[$view[0].id].end();
                } else {
                    $view.remove();
                }
            };
            __$trash__ = jQuery("<view-trash hidden style='display:none'>");
            jQuery("body").append(__$trash__);
            console.info("----view is ready");
        }
    };

});
define({
    name: "view.config",
    extend: "view",
    modules: ["jqrouter", "jQuery"]
}).as(function (CONFIG, jqrouter, jQuery) {

    return {
        events: {
            "click #saveConfig": "saveConfig",
            "change .appField": "appDebug"
        },
        _init_: function () {
            var self = this;
            var config = JSON.parse(window.localStorage.getItem(bootloader.config().bootConfigKey));
            if (!config) {
                config = JSON.parse(JSON.stringify(bootloader.config()));
            }
            delete config.resource;
            return this.$().loadTemplate(this.path("config.html"), {
                configString: JSON.stringify(config, null, "\t"),
                config: config
            });
        },
        appDebug: function (e) {
            var config = jQuery("#configInput").val();
            config = JSON.parse(config);
            switch ((e.target.type).toLowerCase()) {
                case "checkbox" : {
                    config[e.target.id] = e.target.checked;
                    break;
                }
                case "text" : {
                    config[e.target.id] = e.target.value;
                    break;
                }
            }
            config = JSON.stringify(config, null, "\t");
            jQuery("#configInput").val(config);
        },
        saveConfig: function () {
            var config = jQuery("#configInput").val();
            config = JSON.stringify(JSON.parse(config));
            delete config.resourceJson;
            window.localStorage.setItem(bootloader.config().bootConfigKey, config);
            alert("Config Saved");
        }
    };

});
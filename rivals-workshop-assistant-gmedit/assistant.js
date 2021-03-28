(function() {
    GMEdit.register("rivals-workshop-assistant-gmedit", {
        init: function() {
            window.alert("Loaded rivals-workshop-assistant-gmedit");
            GMEdit.on("fileSave", function() {
                    window.alert("Save assistant");
                }

            )
        },
    });
})();


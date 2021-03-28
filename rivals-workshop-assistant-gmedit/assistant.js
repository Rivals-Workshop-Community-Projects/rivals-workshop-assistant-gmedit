(function () {
    const childProcess = require("child_process")
    const pluginRootDir = $gmedit["plugins.PluginManager"].pluginDir['rivals-workshop-assistant-gmedit'];
    const pluginDir = pluginRootDir + '/rivals-workshop-assistant-gmedit';

    function inject() {
        const projectDir = $gmedit["gml.Project"].current.dir;
        const command = pluginDir + `\\rivals_workshop_assistant.exe ` + projectDir;
        console.log('Assistant command: ' + command);

        childProcess.execFile(command, [pluginDir], {shell: true}, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                window.alert('Rivals-lib error. Check dev console or log in extension folder.');
            }
        });
    }

    GMEdit.register("rivals-workshop-assistant-gmedit", {
        init: function () {
            GMEdit.on("fileSave", function () {
                inject()
            })
        },
    });
})();


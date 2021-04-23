(function () {
    const childProcess = require("child_process")
    const pluginRootDir = $gmedit["plugins.PluginManager"].pluginDir['rivals-workshop-assistant-gmedit'];
    const pluginDir = pluginRootDir + '/rivals-workshop-assistant-gmedit';

    const chokidar = require(pluginDir + '/chokidar');

    function getProjectDir(){
        return $gmedit["gml.Project"].current.dir;
    }

    function runAssistant(env) {
        console.log("RUN")
        const projectDir = getProjectDir()
        const command = pluginDir + `\\rivals_workshop_assistant.exe ` + projectDir;
        console.log("Command: ", command)
        try {
            stdout = childProcess.execFileSync(command, [pluginDir], {shell: true})
        } catch (err) {
            console.log(err);
            return;
        }
        console.log(`stdout: ${stdout}`);

        // Manually reload gmedit window.
        try {
            env.file.editor.load();
            env.file.editor.session.setValue(env.file.code);
        } catch (err) {}
    }

    GMEdit.register("rivals-workshop-assistant-gmedit", {
        init: function () {
            console.log('Assistant activated');

            GMEdit.on("fileSave", function (env) {
                runAssistant(env);
            })

            const watcherEnvs = new Set()
            const watcher = chokidar.watch().on('change', (path, event) => {
                console.log(`${path} changed. Reexporting.`)
                for (const env of watcherEnvs) {
                    runAssistant(env)
                }
            })

            GMEdit.on("projectOpen", function(env) {
                console.log("Will now watch: "+`${getProjectDir()}/anims/`)
                watcher.add(`${getProjectDir()}/anims/`)
                watcherEnvs.add(env)
            })

        },
    });
})();
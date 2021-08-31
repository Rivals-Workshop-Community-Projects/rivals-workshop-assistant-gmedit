(function () {
    const childProcess = require("child_process")
    const pluginRootDir = $gmedit["plugins.PluginManager"].pluginDir['rivals-workshop-assistant-gmedit'];
    const pluginDir = pluginRootDir + '/rivals-workshop-assistant-gmedit';

    const chokidar = require(pluginDir + '/chokidar');

    // const ALL_MODE = "all";
    const ANIMS_MODE = "anims";
    const SCRIPTS_MODE = "scripts";

    function getProjectDir() {
        return $gmedit["gml.Project"].current.dir;
    }

    function reloadEditor(env) {
        try {
            const cursor = env.file.codeEditor.session.multiSelect.cursor;
            const row = cursor.row; // Need to unpack to avoid being overwritten
            const column = cursor.column;

            // Manually reload gmedit window.
            env.file.editor.load();
            env.file.editor.session.doc.setValue(env.file.code);
            env.file.editor.session.selection.moveCursorTo(row, column);
        } catch (err) {
            console.log("Error in file refresh", err)
        }
    }

    function runAssistant(mode) {
        const projectDir = getProjectDir()
        const command = `"${pluginDir}\\rivals_workshop_assistant.exe" ` + `"${projectDir}" ` + mode;
        console.log("Running Command: ", command)
        try {
            const stdout = childProcess.execFileSync(command, [pluginDir], {shell: true})
            console.log(`stdout: ${stdout}`);
        } catch (err) {
            console.log(err);
            throw err
        }
    }

    GMEdit.register("rivals-workshop-assistant-gmedit", {
        init: function () {
            console.log('Assistant activated');

            GMEdit.on("fileSave", function (env) {
                console.log(`File saved. Reexporting.`)
                runAssistant(SCRIPTS_MODE);
                reloadEditor(env);
            })

            const watcherEnvs = []
            const watcher = chokidar.watch([], {
                awaitWriteFinish: {
                    stabilityThreshold: 2000,
                    pollInterval: 100
                },
            }).on('change', (path, event) => {
                console.log(`${path} changed. Reexporting.`)
                for (const env of watcherEnvs) {
                    runAssistant(ANIMS_MODE);
                }
            })

            GMEdit.on("projectOpen", function (env) {
                console.log("Will now watch: " + `${getProjectDir()}/anims/`)
                watcher.add(`${getProjectDir()}/anims/`)
                if (!watcherEnvs.map(env => env.path).includes(env.path)) {
                    watcherEnvs.push(env)
                }
            })
        },
    });
})();

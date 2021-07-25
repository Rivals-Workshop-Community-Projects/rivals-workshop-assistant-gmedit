(function () {
    const childProcess = require("child_process")
    const pluginRootDir = $gmedit["plugins.PluginManager"].pluginDir['rivals-workshop-assistant-gmedit'];
    const pluginDir = pluginRootDir + '/rivals-workshop-assistant-gmedit';

    const chokidar = require(pluginDir + '/chokidar');

    function getProjectDir() {
        return $gmedit["gml.Project"].current.dir;
    }

    function runAssistantInAseprite(env) {
        const undoManager = env.file.editor.session.getUndoManager()
        undoManager.$keepRedoStack = true;

        runAssistant(env)

        console.log(env)
        try {
            const cursor = env.file.codeEditor.session.multiSelect.cursor;
            const row = cursor.row;
            const column = cursor.column;

            // Manually reload gmedit window.
            env.file.editor.load();
            env.file.editor.session.setValue(env.file.code);
            env.file.editor.session.selection.moveCursorTo(row, column);

            // console.log("New undo manager", undoManager)
            // env.file.editor.session.setUndoManager(undoManager);
            // console.log("After setting new undo manager", env.file.editor.session.getUndoManager())
        } catch (err) {
            console.log("Error in file refresh", err)
        }
    }

    function runAssistant(env) {
        const projectDir = getProjectDir()
        const command = `"${pluginDir}\\rivals_workshop_assistant.exe" ` + `"${projectDir}"`;
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
                runAssistantInAseprite(env);
            })

            const watcherEnvs = []
            const watcher = chokidar.watch().on('change', (path, event) => {
                console.log(`${path} changed. Reexporting.`)
                for (const env of watcherEnvs) {
                    console.log(`Running for`, env)
                    runAssistant(env)
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

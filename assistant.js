(function () {
    const childProcess = require("child_process")
    const pluginRootDir = $gmedit["plugins.PluginManager"].pluginDir['rivals-workshop-assistant-gmedit'];
    const pluginDir = pluginRootDir + '/rivals-workshop-assistant-gmedit';

    const chokidar = require(pluginDir + '/chokidar');
    // const AceGmlWarningMarker = $gmedit['ace.gml.AceGmlWarningMarker'];

    function getProjectDir(){
        return $gmedit["gml.Project"].current.dir;
    }

    function runAssistant(env) {
        const projectDir = getProjectDir()
        const command = `"${pluginDir}\\rivals_workshop_assistant.exe" `+ `"${projectDir}"`;
        console.log("Command: ", command)
        try {
            stdout = childProcess.execFileSync(command, [pluginDir], {shell: true})
            console.log(`stdout: ${stdout}`);
        } catch (err) {
            console.log(err);
            return;
        }
        try {
            const cursor = env.file.codeEditor.session.multiSelect.cursor;
            const row = cursor.row;
            const column = cursor.column;
            // Manually reload gmedit window.
            env.file.editor.load();
            env.file.editor.session.setValue(env.file.code);
            env.file.editor.session.selection.moveCursorTo(row, column);
            // console.log("gonna do it")
            // addWarnings(env)
            // console.log("done")
        } catch (err) {
            if (err instanceof RangeError) {
                
              } else {
                throw err;
              }
        }      
    }

    // function addWarning(env, text, lineNum) {
    //     console.log("starting", env, AceGmlWarningMarker)
    //     var marker = new AceGmlWarningMarker(env.file.editor.session,
    //         lineNum,
    //         "ace_warning-line");
    //
    //     session.gmlErrorMarkers.push(marker.addTo(session));
    //
    //     annotations.push({
    //         row: lineNum, column: 0, type: "warning", text: text
    //     });
    //     console.log("finishing")
    // }
    //
    // function addWarnings(env) {
    //     addWarning(env, "test warning", 3)
    // }

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
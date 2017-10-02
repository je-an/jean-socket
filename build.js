({
    baseUrl: '.',
    out: 'dist/jean-socket.js',
    optimize: 'uglify2',
    name: "node_modules/jean-amd/dist/jean-amd",
    include: ["src/Socket"],
    wrap: {
        start: 
        "(function (root, factory) { \n" +
        " \t if (typeof define === 'function' && define.amd) { \n" +
        "\t \t define([], factory); \n" +
        "\t} else { \n" +
        "\t \troot.Socket = root.Socket || {}; \n" +
        "\t \troot.Socket = factory();\n" +
        "\t}\n" +
        "}(this, function() {",
        end:
        "\n \t return require('src/Socket'); \n" +
        "}));"
    }, 
    paths: {
        TypeCheck: "node_modules/jean-type-check/src/TypeCheck",
        Callback: "node_modules/jean-callback/src/Callback"
    }
})
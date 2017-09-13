({
    baseUrl: '.',
    out: 'dist/Socket.js',
    optimize: 'none',
    include: ["node_modules/almond/almond", "src/Socket"],
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
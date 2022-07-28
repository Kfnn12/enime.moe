import { defineNuxtConfig } from 'nuxt';

export default defineNuxtConfig({
    transpile: ["@vime/vue-next", "@vime/core"],

    modules: [
        "nuxt-windicss",
        "@vueuse/nuxt",
        "@pinia/nuxt",
        "nuxt-storm",
        // "@nuxtjs/partytown"
    ],

    components: true,

    ssr: true,

    css: [
        "virtual:windi-base.css",
        "virtual:windi-components.css",
        "virtual:windi-utilities.css",
        "@/assets/style/font.scss",
        "@/assets/style/app.scss",
    ],

    windicss: {
        scan: {
            dirs: ["./"],
            exclude: [
                "node_modules",
                "dist"
            ]
        }
    },

    vueuse: {
        ssrHandlers: true,
    },

    vue: {
        compilerOptions: {
            isCustomElement: tag => tag.startsWith("vds-")
        }
    },

    link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }
    ],

    /*
    partytown: {
        forward: ["dataLayer.push"],
    },
     */

    app: {
        head: {
            script: [
                { children: `window.dataLayer = window.dataLayer || [];\n` +
                        "  function gtag(){dataLayer.push(arguments);}\n" +
                        "  gtag('js', new Date());\n" +
                        "\n" +
                        `  gtag('config', "G-57VGSBQP6C");` },
                { src: `https://www.googletagmanager.com/gtag/js?id=G-57VGSBQP6C`, async: true/*, type: 'text/partytown'*/ },
            ],
        },
    },
})

import {execSync} from "child_process";

const getInfo = formats => formats.map(format => execSync(`git log -1 --format=${format}`).toString().trim());

const comment = (message, author, date) => `
<!--

    Last Commit: 

    ${message}
    ----------
    Author: ${author}
    Date: ${date}

-->`;

export const commit = () => {
    const [message, author, date] = getInfo(["%s", "%an", "%cd"]);

    return {
        name: "commit",
        transformIndexHtml: {
            order: "pre",
            handler(html) {
                return comment(message, author, date) + html;
            },
        },
    };
};

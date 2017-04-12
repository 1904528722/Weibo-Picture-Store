/**
 * File Upload
 */
{

    const failId = Utils.randomString(16);
    const url = "http://picupload.service.weibo.com/interface/pic_upload.php";

    Weibo.fileUpload = (hybrid, replay) => {
        let uid = null;
        let buffer = [];
        let waitRevokeURL = [];
        let total = hybrid.length;
        let revokeUselessURL = () => {
            for (let objectURL of waitRevokeURL) {
                URL.revokeObjectURL(objectURL);
            }
        };

        for (let item of hybrid) {
            let oneline = Pipeline[item.readType];
            let promise = fetch(Utils.createURL(url, oneline.getParam({
                mime: item.file.type,
            })), Utils.blendParams({
                method: "POST",
                body: oneline.getBody(item.result),
            })).then(response => {
                return response.ok ? response.text() : Promise.reject();
            }).then(text => {
                if (text) {
                    let tree = new DOMParser().parseFromString(text, "application/xml");
                    let data = tree.querySelector("root > data").textContent;
                    let pics = tree.querySelector("root > pics");
                    let pid = pics.querySelector("pic_1 > pid").textContent;
                    let size = pics.querySelector("pic_1 > size").textContent;
                    let width = pics.querySelector("pic_1 > width").textContent;
                    let height = pics.querySelector("pic_1 > height").textContent;

                    if (pid) {
                        if (!uid) {
                            try {
                                uid = JSON.parse(atob(data)).uid.toString();
                            } catch (e) {}
                        }
                        Weibo.pidUpload({pid, uid});
                        let file = item.file;
                        let objectURL = item.objectURL;
                        return {file, objectURL, pid, size, width, height};
                    } else {
                        return Promise.reject();
                    }
                } else {
                    return Promise.reject();
                }
            }).catch(reason => {
                item.objectURL && waitRevokeURL.push(item.objectURL);
            });

            buffer.push(promise);
        }

        return Promise.all(buffer).then(rawData => {
            let pureData = [];
            for (let item of rawData) {
                item && pureData.push(item);
            }
            if (total && !pureData.length && !replay) {
                return Utils.singleton(Weibo.setStatus)
                    .then(result => {
                        if (result.login) {
                            return Weibo.fileUpload(hybrid, true);
                        } else {
                            revokeUselessURL();
                            return pureData;
                        }
                    })
                    .catch(reason => {
                        reason.login && chrome.notifications.create(failId, {
                            type: "basic",
                            iconUrl: chrome.i18n.getMessage("64"),
                            title: chrome.i18n.getMessage("fail_title"),
                            message: chrome.i18n.getMessage("file_upload_failed"),
                        });
                        revokeUselessURL();
                        return pureData;
                    });
            } else {
                revokeUselessURL();
                return pureData;
            }
        });
    };

}

/**
 * File Progress
 */
{

    const types = new Set(["TYPE_UPLOAD", "TYPE_DOWNLOAD"]);
    const Store = new Map();
    const BuildStore = class {
        constructor() {
            this.total = 0;
            this.settle = 0;
            this.notifyId = Utils.randomString(16);
            this.requestId = null;
        }
        accumulator() {
            this.settle++;
        }
        addNextWave(n) {
            if (Number.isInteger(n) && n > 0) {
                this.total += n;
            }
        }
    };

    Weibo.fileProgress = (tid) => {
        if (!types.has(tid)) {
            tid = 1;
        }
        let dtd = Store.get(tid);
        let end = tid === Weibo.fileProgress.TYPE_UPLOAD;
        let avr = 3;
        let fps = 60;
        let max = 0.9;
        let sec = avr * dtd.total;
        let bio = sec * fps;
        let gap = 100 / dtd.total;
        let step = gap * max / sec / fps;
        let time = 0;
        let message = "";
        let contextMessage = "";

        switch (tid) {
            case Weibo.fileProgress.TYPE_UPLOAD:
                message = chrome.i18n.getMessage("upload_progress_message");
                contextMessage = chrome.i18n.getMessage("upload_progress_hinter");
                break;
            case Weibo.fileProgress.TYPE_DOWNLOAD:
                message = chrome.i18n.getMessage("download_progress_message");
                contextMessage = chrome.i18n.getMessage("download_progress_hinter");
                break;
        }

        let loop = (timeStamp) => {
            let next = Math.floor(dtd.settle * gap + (dtd.total - dtd.settle) * time * step);

            if (next < 10) next = 10;
            if (next > 100) next = 100;
            time > bio ? time = bio : time++;

            chrome.notifications.create(dtd.notifyId, {
                type: "progress",
                iconUrl: chrome.i18n.getMessage("64"),
                title: chrome.i18n.getMessage("info_title"),
                message: message,
                contextMessage: contextMessage,
                progress: next,
                requireInteraction: true,
            }, notificationId => {
                if (dtd.settle === dtd.total) {
                    dtd.requestId && cancelAnimationFrame(dtd.requestId);
                    chrome.notifications.clear(notificationId, wasCleared => {
                        wasCleared && end && chrome.notifications.create(dtd.notifyId, {
                            type: "basic",
                            iconUrl: chrome.i18n.getMessage("64"),
                            title: chrome.i18n.getMessage("info_title"),
                            message: chrome.i18n.getMessage("file_upload_ended"),
                        });
                    });
                }
            });

            dtd.requestId = requestAnimationFrame(loop);
        };

        return {
            accumulator: dtd.accumulator.bind(dtd),
            addNextWave: dtd.addNextWave.bind(dtd),
            triggerProgress: () => {
                dtd.requestId && cancelAnimationFrame(dtd.requestId);
                dtd.requestId = requestAnimationFrame(loop);
            },
        };
    };

    types.forEach((item, index) => {
        Weibo.fileProgress[item] = index + 1;
        Store.set(Weibo.fileProgress[item], new BuildStore());
    });

}
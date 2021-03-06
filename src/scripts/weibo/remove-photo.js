/*
 * Copyright (c) 2018 The Weibo-Picture-Store Authors. All rights reserved.
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file.
 */

import {Utils} from "../sharre/utils.js";
import {setStatus} from "./set-status.js";

const url = "http://photo.weibo.com/albums/delete_batch";
const doneCode = 0;

/**
 * @async
 */
export async function removePhoto(albumId, photoIds, replay) {
    if (!albumId || !Array.isArray(photoIds) || !photoIds.length) {
        return Promise.reject("Invalid Params");
    }

    return Utils.fetch(url, {
        method: "POST",
        body: Utils.createSearchParams({
            album_id: albumId,
            photo_id: photoIds.join(","),
        }),
    }).then(response => {
        return response.ok ? response.json() : Promise.reject(response.status);
    }).then(json => {
        if (json && json.code === doneCode && json.result) {
            return json;
        } else {
            return Promise.reject("Invalid Data");
        }
    }).catch(reason => {
        if (replay) {
            return Promise.reject(reason);
        } else {
            return setStatus().then(json => {
                if (json.login) {
                    return removePhoto(albumId, photoIds, true);
                } else {
                    return Promise.reject(reason);
                }
            });
        }
    });
}

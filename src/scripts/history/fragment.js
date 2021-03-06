/*
 * Copyright (c) 2018 The Weibo-Picture-Store Authors. All rights reserved.
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file.
 */

import {Utils} from "../sharre/utils.js";

const headHTML = `
    <h1>
        <span><i class="fa fa-paragraph"></i></span>
        <span>上传记录</span>
    </h1>`;

const footHTML = `
    <div class="foot-bottom">
        <div class="foot-line"></div>
        <div class="foot-menu">
            <a href="https://github.com/Semibold/Weibo-Picture-Store/issues" target="_blank" title="GitHub Issues">GitHub</a>
            <a href="mailto:abc@hub.moe" title="通过电子邮件反馈问题">反馈</a>
            <a href="donate.html" target="_blank" title="扩展很棒，捐赠以表支持 +1s">捐赠</a>
            <a href="https://github.com/Semibold/Weibo-Picture-Store/blob/master/changelog.md" target="_blank" title="操作指南及更新日志">更新日志</a>
        </div>
    </div>`;

document.getElementById("head").append(Utils.parseHTML(headHTML));
document.getElementById("foot").append(Utils.parseHTML(footHTML));

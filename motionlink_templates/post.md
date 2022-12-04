---
title: "{{{otherData.pageTitle}}}"
date: {{{otherData.date}}}
author: "{{{otherData.author}}}"
draft: false

image: "{{{otherData.thumbnail}}}"
description: "{{{otherData.description}}}"

categories:
  {{#otherData.categories}}
  - {{{.}}}
  {{/otherData.categories}}

tags:
  {{#otherData.tags}}
  - {{{.}}}
  {{/otherData.tags}}

type: {{{otherData.type}}}
---

{{{otherData.content}}}

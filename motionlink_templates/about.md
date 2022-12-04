---
title: "About Us"
date: 2019-10-29T13:49:23+06:00
draft: false

# meta description
description: "Website about financial stuff"

# type
type : "about"

teamMembers:
  {{#otherData.teamMembers}}
  - name: "{{name}}"
    photo: "{{{photo}}}"
    about: "{{about}}"
    socials:
    {{#socials}}
      - link: "{{{url}}}"
        icon: "{{{icon}}}"
        title: "{{{title}}}"
    {{/socials}}
  {{/otherData.teamMembers}}
---

{{{otherData.content}}}

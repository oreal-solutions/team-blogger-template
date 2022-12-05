// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const markdownService = require("motionlink-cli/lib/services/markdown_service");
const ObjectTransformers = markdownService.ObjectTransformers;
const BlockTransformers = markdownService.BlockTransformers;

let postIndex = 0;
function getNextPostIndex() {
  return postIndex++;
}

const allFilter = {
  or: [
    {
      property: "Status",
      select: {
        equals: "Published",
      },
    },
    {
      property: "Status",
      select: {
        equals: "Completed",
      },
    },
    {
      property: "Status",
      select: {
        equals: "Public",
      },
    },
  ],
};

/** @type {import("motionlink-cli/lib/models/config_models").TemplateRule[]} */
const rules = [
  {
    template: "motionlink_templates/post.md",
    outDir: "content/blog",
    writeMediaTo: "static/images",
    uses: {
      database: "articles",
      fetchBlocks: true,
      filter: allFilter,
      sort: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
      map: (page, context) => {
        page._title = `post-${getNextPostIndex()}`;
        page.otherData.date = page.data.last_edited_time;

        if (page.data.properties.Type.type === "select") {
          page.otherData.type =
            page.data.properties.Type.select.name.toLowerCase();
        }

        if (page.data.properties.Author.type === "select") {
          page.otherData.author = page.data.properties.Author.select.name;
        }

        const pageTitle = ObjectTransformers.transform_all(
          // @ts-ignore
          page.data.properties.Title.title
        );
        page.otherData.pageTitle = pageTitle;
        page.otherData.description = pageTitle;

        // The page thumbnail is the first image in the page
        const defaultImageBlockTransformer = BlockTransformers.image;

        /**@type {import("motionlink-cli/lib/models/config_models").NotionBlock}*/
        let thumbnailBlock = undefined;
        BlockTransformers.image = (block, rule) => {
          if (block.type === "image") {
            if (thumbnailBlock === undefined) {
              thumbnailBlock = {
                data: block,
                children: [],
              };

              return "";
            } else {
              return defaultImageBlockTransformer(block, rule);
            }
          }

          return "";
        };

        page.otherData.content = context.genMarkdownForBlocks(page.blocks);

        if (thumbnailBlock === undefined) {
          throw new Error(
            "This page does not have a thumbnail. All pages must have a thumbnail."
          );
        }

        if (thumbnailBlock.data.type === "image") {
          const thumbnailMedia = context.fetchMedia(
            // @ts-ignore
            thumbnailBlock.data.image
          );

          page.otherData.thumbnail = `images/${thumbnailMedia.src}`;
        }

        page.otherData.categories =
          // @ts-ignore
          page.data.properties.Categories.multi_select.map(
            // @ts-ignore
            (/** @type {{ name: any; }} */ category) => category.name
          );

        page.otherData.tags =
          // @ts-ignore
          page.data.properties.Tags.multi_select.map(
            // @ts-ignore
            (/** @type {{ name: any; }} */ tag) => tag.name
          );

        return page;
      },
    },
    alsoUses: [],
  },

  {
    template: "motionlink_templates/about.md",
    outDir: "content/about",
    writeMediaTo: "static/about",
    uses: {
      database: "profile",
      sort: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
      takeOnly: 1,
      fetchBlocks: true,
      filter: allFilter,
      map: (page, context) => {
        page._title = "_index";
        page.otherData.content = context.genMarkdownForBlocks(page.blocks);
        page.otherData.teamMembers = context.others.team.pages.map(
          (memberPage) => memberPage.otherData
        );
        return page;
      },
    },
    alsoUses: [
      {
        database: "team",
        fetchBlocks: true,
        filter: allFilter,
        map: (page, context) => {
          /**@type {import("motionlink-cli/lib/models/config_models").NotionBlock}*/
          let thumbnailBlock = undefined;
          BlockTransformers.image = (block, _) => {
            thumbnailBlock = {
              data: block,
              children: [],
            };

            return "";
          };

          const about = context.genMarkdownForBlocks(page.blocks);
          if (thumbnailBlock === undefined) {
            throw new Error("All users must have a profile image");
          }

          const socials = [
            {
              property: page.data.properties.Facebook,
              icon: "ti-facebook",
              title: "facebook",
            },
            {
              property: page.data.properties.Twitter,
              icon: "ti-twitter",
              title: "twitter",
            },
            {
              property: page.data.properties.Instagram,
              icon: "ti-instagram",
              title: "instagram",
            },
            {
              property: page.data.properties.LinkedIn,
              icon: "ti-linkedin",
              title: "linkedin",
            },
          ];

          const socialsAsObjects = socials
            .map((social) => {
              let url = "";
              if (
                social.property?.type === "url" &&
                social.property.url !== null
              ) {
                url = social.property.url.trim();
              }

              return {
                url: url,
                icon: social.icon,
                title: social.title,
              };
            })
            .filter((social) => social.url.length !== 0);

          page.otherData = {
            // @ts-ignore
            name: ObjectTransformers.transform_all(
              // @ts-ignore
              page.data.properties.Name.title
            ).trim(),
            // @ts-ignore
            photo: context.fetchMedia(thumbnailBlock.data.image).src,
            about: about.trim(),
            socials: socialsAsObjects,
          };

          return page;
        },
      },
    ],
  },

  {
    template: "motionlink_templates/config.toml",
    outDir: ".",
    alsoUses: [],
    uses: {
      database: "profile",
      sort: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
      takeOnly: 1,
      fetchBlocks: false,
      filter: allFilter,
      map: (page, _) => {
        page._title = "config";
        page.otherData.currentYear = new Date().getFullYear();

        if (page.data.properties.Email.type === "rich_text") {
          page.otherData.email = ObjectTransformers.transform_all(
            // @ts-ignore
            page.data.properties.Email.rich_text
          );
        }

        if (page.data.properties.Facebook.type === "url") {
          page.otherData.facebook = page.data.properties.Facebook.url;
        }

        if (page.data.properties.Instagram.type === "url") {
          page.otherData.instagram = page.data.properties.Instagram.url;
        }

        if (page.data.properties.Twitter.type === "url") {
          page.otherData.twitter = page.data.properties.Twitter.url;
        }

        if (page.data.properties.LinkedIn.type === "url") {
          page.otherData.linkedin = page.data.properties.LinkedIn.url;
        }

        return page;
      },
    },
  },
];

module.exports = rules;

export default {
  AUTH: {
    NAME: "Auth",
    SCREENS: {
      SIGN_UP: "SignUp",
      SIGN_IN: "SignIn",
    },
  },
  APP: {
    NAME: "App",
    SCREENS: {
      FILE: "File",
      MENU: {
        NAME: "Menu",
        SCREENS: {
          HOME: "Home",
          STARRED: "Starred",
          FILES: {
            NAME: "Files",
            SCREENS: {
              ALL: "All",
              FOLDER: "Folder",
              FILE: "File"
            },
          },
          PROFILE: "Profile",
        },
      },
    },
  },
} as const;

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
      FOLDER: "Folder",
      SEARCH: {
        NAME: "Search",
        SCREENS: {
          LOCALE: "Locale",
          GLOBAL: "Global",
        },
      },
      MENU: {
        NAME: "Menu",
        SCREENS: {
          HOME: "Home",
          STARRED: "Starred",
          PUBLIC: "Public",
          PROFILE: "Profile",
        },
      },
    },
  },
} as const;

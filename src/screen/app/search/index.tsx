import { useEffect, useTransition } from "react";
import { Appbar, Searchbar } from "react-native-paper";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { store, useStackNavigation } from "../../../hook";
import { ROUTER } from "../../../constant";

const TopTab = createMaterialTopTabNavigator();

function SearchField() {
  const [_isPending, startTransition] = useTransition();
  const search = store.useSearch((state) => state.search);
  const setState = store.useSearch((state) => state.setState);

  return (
    <Searchbar
      mode="view"
      placeholder="Search"
      value={search}
      onChangeText={(text) => {
        startTransition(() => {
          const trimmed = text.trimStart();
          if ((trimmed.length === 0 && text.length > 0) || trimmed === search)
            return;
          setState({ search: trimmed });
        });
      }}
    />
  );
}

export default function Search() {
  const stackNavigation = useStackNavigation();
  const reset = store.useSearch((state) => state.reset);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() =>
            stackNavigation.canGoBack()
              ? stackNavigation.goBack()
              : stackNavigation.navigate(ROUTER.APP.SCREENS.MENU.NAME, {
                  screen: ROUTER.APP.SCREENS.MENU.SCREENS.HOME,
                })
          }
        />
        <Appbar.Content title="Search" />
      </Appbar.Header>
      <SearchField />
      <TopTab.Navigator>
        <TopTab.Screen
          name={ROUTER.APP.SCREENS.SEARCH.SCREENS.LOCALE}
          component={require("./Locale").default}
        />
        <TopTab.Screen
          name={ROUTER.APP.SCREENS.SEARCH.SCREENS.GLOBAL}
          component={require("./Global").default}
        />
      </TopTab.Navigator>
    </>
  );
}

import { Directory } from "../../../components";
import { store } from "../../../hook";

export default function Locale() {
  const search = store.useSearch((state) => state.search);
  return (
    <Directory
      key={search}
      path={`/user/search?q=${encodeURIComponent(
        search
      )}&mode=${encodeURIComponent("locale")}`}
      disableActions
      folderId={0}
    />
  );
}

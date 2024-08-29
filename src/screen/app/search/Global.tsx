import { Directory } from "../../../components";
import { store } from "../../../hook";

export default function Global() {
  const search = store.useSearch((state) => state.search);
  return (
    <Directory
      key={search}
      path={`/user/search?q=${encodeURIComponent(
        search
      )}&mode=${encodeURIComponent("global")}`}
      disableActions
      folderId={0}
    />
  );
}

import { Text } from "ink";
import Spinner from "ink-spinner";

export const SearchSpinner = () => {
  return (
    <Text>
      <Spinner type="dots" /> Searching...
    </Text>
  );
};

import * as React from "react";
import Checkbox from "@cloudscape-design/components/checkbox";

export default () => {
  const [checked, setChecked] = React.useState(false);
  return (
    <Checkbox
      onChange={({ detail }) =>
        setChecked(detail.checked)
      }
      checked={checked}
    >
    </Checkbox>
  );
}
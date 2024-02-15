import * as React from "react";
import { styled } from "@mui/system";
 
const Container = styled("div")(
  ({
    theme,
    topped,
    noWidth,
    fullHeight,
    alignItems,
    alignSelf,
    justifyContent,
    width,
    centered,
    small,
    backColor
  }) => ({
    display: "flex",
    flexFlow: "column",
    marginTop: `${topped ? theme.space.main : 0}`,
    width: `${small ? "70%" : noWidth ? "auto" : width ? width : "100%"}`,
    height: `${fullHeight ? "100%" : "auto"}`,
    alignItems: `${alignItems ? alignItems : "auto"}`,
    alignSelf: `${alignSelf ? alignSelf : "auto"}`,
    justifyContent: `${justifyContent ? justifyContent : "auto"}`,
    margin: `${small ? "0 auto" : centered ? "auto" : "0"}`,
    background: backColor ? backColor : 'none'
  })
);
 
export default function ColumnContainer({
  children,
  small,
  noWidth,
  topped,
  ref,
  background,
  ...props
}) {
  return (
    <Container
      ref={ref}
      small={small ? 1 : 0}
      noWidth={noWidth ? 1 : 0}
      topped={topped ? 1 : 0}
      backColor={background}
      {...props}>
      {children}
    </Container>
  );
}
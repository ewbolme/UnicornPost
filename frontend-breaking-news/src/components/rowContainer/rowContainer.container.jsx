import { styled } from "@mui/system";
 
const StyledContainer = styled("div")(
  ({
    noJustify,
    center,
    end,
    start,
    gap,
    align,
    padding,
    relative,
    hoverColorRow
  }) => ({
    display: "flex",
    gap: `${gap}`,
    justifyContent: `${
      noJustify
        ? "initial"
        : center
        ? "center"
        : end
        ? "flex-end"
        : start
        ? "flex-start"
        : "space-between"
    }`,
    alignItems: `${
      align === "end" ? "end" : align === "start" ? "start" : "center"
    }`,
    padding: `${padding ? padding : "0"} `,
    position: `${relative ? "relative" : "initial"}`,
 
    "&:hover": {
      backgroundColor: hoverColorRow
    }
  })
);
 
export default function RowContainer({ children, end,  ...props }) {
  return (
    <StyledContainer end={end ? 1 : 0} {...props}>
      {children}
    </StyledContainer>
  );
}
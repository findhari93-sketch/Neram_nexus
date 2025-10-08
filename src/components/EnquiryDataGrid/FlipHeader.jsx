import { Box } from "@mui/material";

export default function FlipHeader({
  flipped = false,
  front,
  back,
  height = 60,
}) {
  return (
    <Box sx={{ perspective: 800, height }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 220ms ease-in-out",
          transform: flipped ? "rotateX(180deg)" : "rotateX(0deg)",
        }}
      >
        {/* Front side */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
          }}
        >
          {front}
        </Box>
        {/* Back side */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateX(180deg)",
          }}
        >
          {back}
        </Box>
      </Box>
    </Box>
  );
}

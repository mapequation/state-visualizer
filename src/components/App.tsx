import { useState } from "react";
import { Box, Grid, GridItem, Heading } from "@chakra-ui/react";
import Network from "./Network";
import Settings from "./Settings";
import lumpStateNodes from "../lib/lump-states";
import ErrorBoundary from "../ErrorBoundary";
import Load from "./Load";
import { FlowStateNetwork } from "../lib/merge-states-clu";

export default function App() {
  const [network, setNetwork] = useState<FlowStateNetwork>();
  const [useLumping, setUseLumping] = useState(true);
  const [showNames, setShowNames] = useState(true);
  const [fontSize, setFontSize] = useState(40);
  const [linkDistance, setLinkDistance] = useState(100);
  const [linkWidthRange, setLinkWidthRange] = useState([0.1, 5]);
  const [nodeCharge, setNodeCharge] = useState(-1000);
  const [renderer, setRenderer] = useState<"canvas" | "svg">("svg");

  return (
    <Grid h="100vh" templateColumns="minmax(200px, 20vw) auto">
      <GridItem
        w="100%"
        h="100%"
        boxShadow="2xl"
        px={10}
        py={15}
        overflowY="scroll"
      >
        <Heading as="h1" size="md">
          State Network Visualizer
        </Heading>

        <Load setNetwork={setNetwork} />

        <Settings
          useLumping={useLumping}
          setUseLumping={setUseLumping}
          showNames={showNames}
          setShowNames={setShowNames}
          linkDistance={linkDistance}
          setLinkDistance={setLinkDistance}
          linkWidthRange={linkWidthRange}
          setLinkWidthRange={setLinkWidthRange}
          nodeCharge={nodeCharge}
          setNodeCharge={setNodeCharge}
          fontSize={fontSize}
          setFontSize={setFontSize}
          renderer={renderer}
          setRenderer={setRenderer}
        />

        <Box fontSize="sm" color="gray.500" mt={50}>
          By <a href="//antoneriksson.io">Anton Eriksson</a>
          <br />
          <a href="//mapequation.org">mapequation.org</a>
          <br />
          <a href="//github.com/mapequation/state-visualizer">Source</a>
        </Box>
      </GridItem>

      <GridItem w="100%" overflow="hidden">
        <ErrorBoundary>
          {network && (
            <Network
              network={useLumping ? lumpStateNodes(network) : network}
              fontSize={fontSize}
              nodeRadius={40}
              linkDistance={linkDistance}
              linkWidthRange={linkWidthRange}
              nodeCharge={nodeCharge}
              showNames={showNames}
              renderer={renderer}
            />
          )}
        </ErrorBoundary>
      </GridItem>
    </Grid>
  );
}

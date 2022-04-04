import { Suspense, useMemo, useState } from "react";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import Network, { isValidRenderer, Renderer } from "./Network";
import Settings from "./Settings";
import Load from "./Load";
import ErrorBoundary from "../ErrorBoundary";
import lumpStateNodes from "../lib/lump-states";
import type { FlowStateNetwork } from "../lib/merge-states-clu";

const params = Object.fromEntries(
  new URLSearchParams(window.location.search).entries()
);

export default function App() {
  const [network, setNetwork] = useState<FlowStateNetwork>();
  const [useLumping, setUseLumping] = useState(true);
  const [showNames, setShowNames] = useState(true);
  const [fontSize, setFontSize] = useState(40);
  const [linkDistance, setLinkDistance] = useState(100);
  const [linkWidthRange, setLinkWidthRange] = useState([0.1, 5]);
  const [nodeCharge, setNodeCharge] = useState(-600);
  const [renderer, setRenderer] = useState<Renderer>(
    isValidRenderer(params.mode) ? params.mode : "canvas"
  );

  const net = useMemo(() => {
    if (!network) return;
    console.time("lump");
    const net = useLumping ? lumpStateNodes(network) : network;
    console.timeEnd("lump");
    return net;
  }, [network, useLumping]);

  return (
    <Grid h="100vh" templateColumns="minmax(300px, 20vw) auto">
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

        <section>
          <Text mt={4}>
            State networks can describe higher-order constr&shy;aints, such as
            memory or multi&shy;layer networks. Because of the high
            dimension&shy;ality of state networks, they are difficult to
            visualize.
          </Text>
          <Text mt={2}>
            This tool visualizes state networks by lumping states into a smaller
            number of states, but the raw states can still be explored.
          </Text>
          <Text mt={2}>
            Expect trouble if your input networks are too large (thousands of
            physical nodes).
          </Text>
        </section>

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

        <Box as="nav" fontSize="sm" color="gray.500" my={10}>
          <UnorderedList styleType="none" spacing={3}>
            <ListItem>
              By <a href="//antoneriksson.io">Anton Eriksson</a> (
              <a href="//github.com/mapequation/state-visualizer">
                source code
              </a>
              )
            </ListItem>
            <ListItem>
              <cite>
                <a href="https://www-cs-faculty.stanford.edu/~knuth/sgb.html">
                  Les Misérables
                </a>
              </cite>{" "}
              example data from{" "}
              <a href="//networks.skewed.de/">Netzschleuder</a>
            </ListItem>
            <ListItem>
              <a href="//mapequation.org">
                <img
                  src="//www.mapequation.org/assets/img/twocolormapicon_whiteboarder.svg"
                  width="20"
                  height="20"
                  alt=""
                  style={{
                    display: "inline-block",
                    marginBottom: "-3px",
                    marginRight: "5px",
                  }}
                />{" "}
                mapequation.org
              </a>
            </ListItem>
          </UnorderedList>
        </Box>
      </GridItem>

      <GridItem w="100%" overflow="hidden" bg="#fff">
        <Suspense fallback={null}>
          <ErrorBoundary>
            {net != null && (
              <Network
                network={net}
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
        </Suspense>
      </GridItem>
    </Grid>
  );
}

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
import Infomap from "@mapequation/infomap";
import Network, { isValidRenderer, Renderer } from "./Network";
import Settings from "./Settings";
import Load from "./Load";
import ErrorBoundary from "../ErrorBoundary";
import lumpStateNodes from "../lib/lump-states";
import type { FlowStateNetwork } from "../lib/merge-states-clu";
import networkToDatum from "../lib/network-to-datum";

const params = Object.fromEntries(
  new URLSearchParams(window.location.search).entries()
);

export default function App() {
  const [network, setNetwork] = useState<FlowStateNetwork>();
  const [useLumping, setUseLumping] = useState(true);
  const [interModuleLinks, setInterModuleLinks] = useState(true);
  const [showNames, setShowNames] = useState(true);
  const [fontSize, setFontSize] = useState(40);
  const [linkDistance, setLinkDistance] = useState(100);
  const [linkThreshold, setLinkThreshold] = useState(0);
  const [linkWidthRange, setLinkWidthRange] = useState([0.1, 5]);
  const [nodeCharge, setNodeCharge] = useState(-300);
  const [renderer, setRenderer] = useState<Renderer>(
    isValidRenderer(params.mode) ? params.mode : "canvas"
  );
  const [stateOpacity, setStateOpacity] = useState(0.7);
  const [showPhysicalNodes, setShowPhysicalNodes] = useState(true);

  const net = useMemo(() => {
    if (!network) return;
    console.time("lump");
    const net = useLumping ? lumpStateNodes(network) : network;
    console.timeEnd("lump");
    return networkToDatum(net);
  }, [network, useLumping]);

  return (
    <Grid h="100vh" templateColumns="minmax(300px, 20vw) auto">
      <GridItem
        w="100%"
        h="100%"
        boxShadow="2xl"
        zIndex={1}
        borderColor="gray.100"
        borderRightWidth={1}
        px={10}
        py={15}
        overflowY="auto"
      >
        <Heading as="h1" size="md" display="flex" alignItems="center" gap={2}>
          <a href="//mapequation.org">
            <img
              src="//www.mapequation.org/assets/img/twocolormapicon_whiteboarder.svg"
              width="32px"
              height="32px"
              alt=""
            />
          </a>
          State Network Visualizer
        </Heading>
        <Text fontSize="xs" ml="42px" mt="-5px">
          v{process.env.REACT_APP_VERSION}<br/>
          Powered by Infomap&nbsp;v{Infomap.__version__}
        </Text>

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
          interModuleLinks={interModuleLinks}
          setInterModuleLinks={setInterModuleLinks}
          showNames={showNames}
          setShowNames={setShowNames}
          linkDistance={linkDistance}
          setLinkDistance={setLinkDistance}
          maxLinkWeight={net?.maxLinkWeight ?? 1}
          linkThreshold={linkThreshold}
          setLinkThreshold={setLinkThreshold}
          linkWidthRange={linkWidthRange}
          setLinkWidthRange={setLinkWidthRange}
          nodeCharge={nodeCharge}
          setNodeCharge={setNodeCharge}
          fontSize={fontSize}
          setFontSize={setFontSize}
          renderer={renderer}
          setRenderer={setRenderer}
          showPhysicalNodes={showPhysicalNodes}
          setShowPhysicalNodes={setShowPhysicalNodes}
          stateOpacity={stateOpacity}
          setStateOpacity={setStateOpacity}
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
                renderer={renderer}
                network={net}
                nodeRadius={40}
                linkDistance={linkDistance}
                linkThreshold={linkThreshold}
                linkWidthRange={linkWidthRange}
                nodeCharge={nodeCharge}
                fontSize={fontSize}
                showNames={showNames}
                interModuleLinks={interModuleLinks}
                showPhysicalNodes={showPhysicalNodes}
                stateOpacity={stateOpacity}
              />
            )}
          </ErrorBoundary>
        </Suspense>
      </GridItem>
    </Grid>
  );
}

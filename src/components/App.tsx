import { ChangeEvent, useState } from "react";
import { parseClu } from "@mapequation/infomap/parser";
import {
  Box,
  Button,
  Code,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  ListItem,
  Switch,
  UnorderedList,
} from "@chakra-ui/react";
import type { CluStateNode } from "@mapequation/infomap/filetypes";
import Network from "./Network";
import parseStates from "../lib/parse-states";
import mergeStatesClu from "../lib/merge-states-clu";
import lumpStateNodes from "../lib/lump-states";
import readFile from "../lib/read-file";
import ErrorBoundary from "../ErrorBoundary";
import lesMiserables from "../data";

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [clu, setClu] = useState(parseClu<CluStateNode>(lesMiserables.clu));
  const [net, setNet] = useState(parseStates(lesMiserables.net));
  const [useLumping, setUseLumping] = useState(true);
  const [showNames, setShowNames] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (e?.target?.files) {
      const files = Array.from(e.target.files);

      const netFiles = files.filter((f) => f.name.endsWith(".net"));
      const cluFiles = files.filter((f) => f.name.endsWith(".clu"));
      if (netFiles.length !== 1 || cluFiles.length !== 1) {
        setError("Please select both a .net and a .clu file.");
        return;
      }

      await readFiles(netFiles[0], cluFiles[0]);
    }
  };

  const readFiles = async (netFile: File, cluFile: File) => {
    try {
      const [net, clu] = await Promise.all([
        readFile(netFile),
        readFile(cluFile),
      ]);
      setFiles([netFile, cluFile]);
      setNet(parseStates(net));
      setClu(parseClu<CluStateNode>(clu));
    } catch (e: any) {
      setError(e?.message);
      return;
    }
  };

  const network = mergeStatesClu(net, clu);

  return (
    <Grid h="100vh" templateColumns="minmax(200px, 20vw) auto">
      <GridItem w="100%" h="100%" boxShadow="2xl" px={10} py={15}>
        <Heading as="h1" size="md">
          State Network Visualizer
        </Heading>

        <FormControl mt={10} isRequired isInvalid={error != null}>
          <input
            type="file"
            id="file-upload"
            hidden
            multiple
            accept=".net,.clu"
            onChange={handleChange}
          />
          <Button as="label" htmlFor="file-upload" colorScheme="blue">
            Load files
          </Button>
          <FormHelperText>
            Load Infomap{" "}
            <a href="//mapequation.org/infomap/#InputStates">
              state network (<Code fontSize="0.9em">.net</Code>)
            </a>
            <br />
            and{" "}
            <a href="//mapequation.org/infomap/#OutputClu">
              cluster (<Code fontSize="0.9em">_states.clu</Code>)
            </a>{" "}
            files.
          </FormHelperText>

          {files.length !== 0 && (
            <FormHelperText mt={5}>
              <strong>Files:</strong>
              <UnorderedList>
                {files.map((file) => (
                  <ListItem key={file.name}>{file.name}</ListItem>
                ))}
              </UnorderedList>
            </FormHelperText>
          )}

          <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>

        <FormControl mt={10}>
          <Flex alignItems="center">
            <FormLabel htmlFor="lumping" mb="0">
              Lump states
            </FormLabel>
            <Switch
              id="lumping"
              isChecked={useLumping}
              onChange={(event) => setUseLumping(event.target.checked)}
            />
          </Flex>
          <FormHelperText>
            Lump state nodes in the same module and physical node into one state
            node. Improves performance.
          </FormHelperText>
        </FormControl>

        <FormControl mt={10}>
          <Flex alignItems="center">
            <FormLabel htmlFor="names" mb="0">
              Show node names
            </FormLabel>
            <Switch
              id="names"
              isChecked={showNames}
              onChange={(event) => setShowNames(event.target.checked)}
            />
          </Flex>
          <FormHelperText>Show physical node names</FormHelperText>
        </FormControl>

        <Box fontSize="sm" color="gray.500" mt={50}>
          By <a href="//antoneriksson.io">Anton Eriksson</a>
          <br />
          <a href="//mapeqquation.org">mapequation.org</a>
        </Box>
      </GridItem>

      <GridItem w="100%">
        <ErrorBoundary>
          <Network
            network={useLumping ? lumpStateNodes(network) : network}
            showNames={showNames}
          />
        </ErrorBoundary>
      </GridItem>
    </Grid>
  );
}

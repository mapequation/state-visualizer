import { ChangeEvent, useEffect, useState } from "react";
import {
  Button,
  Code,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  List,
  ListIcon,
  ListItem,
} from "@chakra-ui/react";
import { MdCheckCircle } from "react-icons/md";
import { parseClu } from "@mapequation/infomap-parser";
import { useInfomap } from "@mapequation/infomap-react";
import type { CluStateNode } from "@mapequation/infomap/filetypes";
import parseStates from "../lib/parse-states";
import readFile from "../lib/read-file";
import lesMiserables from "../data";
import mergeStatesClu, { FlowStateNetwork } from "../lib/merge-states-clu";

interface LoadProps {
  setNetwork: (network: FlowStateNetwork) => void;
  defaultNet?: string;
  defaultClu?: string;
}

export default function Load({
  setNetwork,
  defaultNet = lesMiserables.net,
  defaultClu = lesMiserables.clu,
}: LoadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [clu, setClu] = useState(parseClu<CluStateNode>(defaultClu));
  const [net, setNet] = useState(parseStates(defaultNet));
  const [error, setError] = useState<string | null>(null);

  const { runAsync, running } = useInfomap({
    output: ["clu", "states"],
    twoLevel: true,
    silent: true,
    numTrials: 5
  });

  useEffect(() => {
    console.time("merge");
    setNetwork(mergeStatesClu(net, clu));
    console.timeEnd("merge");
  }, [net, clu, setNetwork]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (e?.target?.files) {
      const files = Array.from(e.target.files);

      const netFiles = files.filter((f) => f.name.endsWith(".net"));
      const cluFiles = files.filter((f) => f.name.endsWith(".clu"));
      if (netFiles.length !== 1) {
        setError("Please select a .net file.");
        return;
      }

      await readFiles(netFiles[0], cluFiles[0]);
    }
  };

  const readFiles = async (netFile: File, cluFile?: File) => {
    try {
      console.time("readFiles");

      const [net, clu, states] = await (async () => {
        if (cluFile)
          return await Promise.all([
            readFile(netFile),
            readFile(cluFile)
          ]);

        const network = await readFile(netFile);

        console.time("infomap");
        const result = await runAsync({ network });
        console.timeEnd("infomap");

        if (result?.clu_states == null) {
          throw new Error("No clu_states in result");
        }

        if (result?.states == null) {
          throw new Error("No states in result");
        }

        return [network, result.clu_states, result.states];
      })();


      setFiles(cluFile ? [netFile, cluFile] : [netFile]);

      const network = (() => {
        try {
          return parseStates(net);
        } catch (e) {
          return parseStates(states!);
        }
      })();
      setNet(network);
      setClu(parseClu<CluStateNode>(clu));
      console.timeEnd("readFiles");
    } catch (e: any) {
      setError(e?.message);
      return;
    }
  };

  return (
    <FormControl mt={10} isRequired isInvalid={error != null}>
      <input
        type="file"
        id="file-upload"
        hidden
        multiple
        accept=".net,.clu"
        onChange={handleChange}
      />
      <Button as="label" htmlFor="file-upload" colorScheme="blue" size="sm" isDisabled={running} isLoading={running}>
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
        <br />
        If no <Code fontSize="0.9em">_states.clu</Code> file is provided,
        Infomap will be run with default parameters (5 trials, undirected, two-level).
      </FormHelperText>

      {files.length !== 0 && (
        <FormHelperText mt={5}>
          <strong>Files:</strong>
          <List>
            {files.map((file) => (
              <ListItem key={file.name}>
                <ListIcon as={MdCheckCircle} color="green.500" />
                {file.name} ({humanFileSize(file.size)})
              </ListItem>
            ))}
          </List>
        </FormHelperText>
      )}

      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}

function humanFileSize(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 B";
  const i = parseInt(
    Math.floor(Math.log(bytes) / Math.log(1024)).toString(),
    10
  );
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}

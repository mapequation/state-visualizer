import { ChangeEvent, useEffect, useState } from "react";
import {
  Button,
  Code,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { parseClu } from "@mapequation/infomap/parser";
import type { CluStateNode } from "@mapequation/infomap/filetypes";
import parseStates from "../lib/parse-states";
import lesMiserables from "../data";
import readFile from "../lib/read-file";
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

  useEffect(() => {
    setNetwork(mergeStatesClu(net, clu));
  }, [net, clu, setNetwork]);

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
  );
}

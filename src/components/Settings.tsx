import { useState } from "react";
import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Switch,
  Tooltip,
} from "@chakra-ui/react";
import type { Renderer } from "./Network";
import { renderers } from "./Network";

interface SettingsProps {
  useLumping: boolean;
  setUseLumping: (useLumping: boolean) => void;
  interModuleLinks: boolean;
  setInterModuleLinks: (interModuleLinks: boolean) => void;
  showNames: boolean;
  setShowNames: (showNames: boolean) => void;
  linkDistance: number;
  setLinkDistance: (linkDistance: number) => void;
  linkThreshold: number;
  setLinkThreshold: (linkThreshold: number) => void;
  maxLinkWeight: number;
  linkWidthRange: number[];
  setLinkWidthRange: (linkWidthRange: number[]) => void;
  nodeCharge: number;
  setNodeCharge: (nodeCharge: number) => void;
  fontSize: number;
  setFontSize: (fontSize: number) => void;
  renderer: Renderer;
  setRenderer: (renderer: Renderer) => void;
}

export default function Settings({
  useLumping,
  setUseLumping,
  interModuleLinks,
  setInterModuleLinks,
  showNames,
  setShowNames,
  linkDistance,
  setLinkDistance,
  linkThreshold,
  setLinkThreshold,
  maxLinkWeight,
  linkWidthRange,
  setLinkWidthRange,
  nodeCharge,
  setNodeCharge,
  fontSize,
  setFontSize,
  renderer,
  setRenderer,
}: SettingsProps) {
  const [showLinkDistanceTooltip, setShowLinkDistanceTooltip] = useState(false);
  const [showLinkWidthTooltip, setShowLinkWidthTooltip] = useState(false);
  const [showLinkThresholdTooltip, setShowLinkThresholdTooltip] = useState(false);
  const [showNodeChargeTooltip, setShowNodeChargeTooltip] = useState(false);
  const [showFontSizeTooltip, setShowFontSizeTooltip] = useState(false);

  return (
    <>
      <FormControl mt={5}>
         <FormLabel htmlFor="renderer">Renderer</FormLabel>
         <ButtonGroup isAttached size="sm">
           {renderers.map((r) => (
             <Button
               key={r}
               isDisabled={r === renderer}
               colorScheme={r === renderer? "blue" : "gray"}
               onClick={() => setRenderer(r)}
             >
               {r === "svg" ? "SVG" : "Canvas"}
             </Button>
           ))}
         </ButtonGroup>
         <FormHelperText>
           Canvas is faster than SVG.
         </FormHelperText>
      </FormControl>


      <FormControl mt={5}>
        <Flex alignItems="center">
          <FormLabel htmlFor="lumping" mb="0">
            Lump states
          </FormLabel>
          <Switch
            size="sm"
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

      <FormControl mt={5}>
        <Flex alignItems="center">
          <FormLabel htmlFor="lumping" mb="0">
            Inter-module links
          </FormLabel>
          <Switch
            size="sm"
            id="lumping"
            isChecked={interModuleLinks}
            onChange={(event) => setInterModuleLinks(event.target.checked)}
          />
        </Flex>
        <FormHelperText>
          Control if links whose source and target modules differ should be
          drawn or not. Regardless, they take part in the simulation.
        </FormHelperText>
      </FormControl>

      <FormControl mt={5}>
        <Flex alignItems="center" mb={0}>
          <FormLabel htmlFor="names">Node names</FormLabel>
          <Switch
            size="sm"
            id="names"
            isChecked={showNames}
            onChange={(event) => setShowNames(event.target.checked)}
          />
        </Flex>
      </FormControl>

      <HStack alignItems="center" mt={5}>
        <FormLabel w="60%">Font size</FormLabel>
        <Slider
          defaultValue={fontSize}
          min={15}
          max={100}
          onChangeEnd={(v) => setFontSize(v)}
          onMouseEnter={() => setShowFontSizeTooltip(true)}
          onMouseLeave={() => setShowFontSizeTooltip(false)}
          isDisabled={!showNames}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <Tooltip
            hasArrow
            bg="blue.500"
            color="white"
            placement="top"
            isOpen={showFontSizeTooltip}
            label={fontSize}
          >
            <SliderThumb />
          </Tooltip>
        </Slider>
      </HStack>

      <HStack alignItems="center" mt={5}>
        <FormLabel w="60%">Link distance</FormLabel>
        <Slider
          defaultValue={linkDistance}
          min={50}
          max={400}
          onChangeEnd={(v) => setLinkDistance(v)}
          onMouseEnter={() => setShowLinkDistanceTooltip(true)}
          onMouseLeave={() => setShowLinkDistanceTooltip(false)}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <Tooltip
            hasArrow
            bg="blue.500"
            color="white"
            placement="top"
            isOpen={showLinkDistanceTooltip}
            label={linkDistance}
          >
            <SliderThumb />
          </Tooltip>
        </Slider>
      </HStack>

      <HStack alignItems="center" mt={5}>
        <FormLabel w="60%">Link threshold</FormLabel>
        <Slider
          defaultValue={linkThreshold}
          min={0}
          step={maxLinkWeight / 100}
          max={maxLinkWeight}
          onChangeEnd={(v) => setLinkThreshold(v)}
          onMouseEnter={() => setShowLinkThresholdTooltip(true)}
          onMouseLeave={() => setShowLinkThresholdTooltip(false)}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <Tooltip
            hasArrow
            bg="blue.500"
            color="white"
            placement="top"
            isOpen={showLinkThresholdTooltip}
            label={linkThreshold.toPrecision(maxLinkWeight.toString().length)}
          >
            <SliderThumb />
          </Tooltip>
        </Slider>
      </HStack>

      <HStack alignItems="center" mt={5}>
        <FormLabel w="60%">Link width</FormLabel>
        <RangeSlider
          defaultValue={linkWidthRange}
          min={0}
          max={10}
          step={0.1}
          onChangeEnd={(v) => setLinkWidthRange(v)}
          onMouseEnter={() => setShowLinkWidthTooltip(true)}
          onMouseLeave={() => setShowLinkWidthTooltip(false)}
        >
          <RangeSliderTrack>
            <RangeSliderFilledTrack />
          </RangeSliderTrack>
          <Tooltip
            hasArrow
            bg="blue.500"
            color="white"
            placement="top"
            isOpen={showLinkWidthTooltip}
            label={linkWidthRange[0].toString()}
          >
            <RangeSliderThumb index={0} />
          </Tooltip>
          <Tooltip
            hasArrow
            bg="blue.500"
            color="white"
            placement="top"
            isOpen={showLinkWidthTooltip}
            label={linkWidthRange[1]}
          >
            <RangeSliderThumb index={1} />
          </Tooltip>
        </RangeSlider>
      </HStack>

      <HStack alignItems="center" mt={5}>
        <FormLabel w="60%">Node charge</FormLabel>
        <Slider
          defaultValue={-nodeCharge}
          min={10}
          max={1000}
          step={10}
          onChangeEnd={(v) => setNodeCharge(-v)}
          onMouseEnter={() => setShowNodeChargeTooltip(true)}
          onMouseLeave={() => setShowNodeChargeTooltip(false)}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <Tooltip
            hasArrow
            bg="blue.500"
            color="white"
            placement="top"
            isOpen={showNodeChargeTooltip}
            label={-nodeCharge}
          >
            <SliderThumb />
          </Tooltip>
        </Slider>
      </HStack>
    </>
  );
}

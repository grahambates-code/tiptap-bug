import { SuggestionProps } from "@tiptap/suggestion";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Box, Button, VStack, Text } from "@chakra-ui/react";

const TypeList = forwardRef<unknown, SuggestionProps>((props, ref) => {
  const [selectedType, setSelectedType] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedType(
        (selectedType + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedType((selectedType + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedType);
  };

  useEffect(() => setSelectedType(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: React.KeyboardEvent<HTMLDivElement> }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
      <VStack
          spacing={2}
          align="stretch"
          bg="gray.50"
          p={3}
          borderRadius="md"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          maxW="300px"
      >
        {props.items.length > 0 ? (
            props.items.map((item, index) => (
                <Button
                    key={index}
                    onClick={() => selectItem(index)}
                    size="sm"
                    colorScheme={index === selectedType ? "blue" : "gray"}
                    variant={index === selectedType ? "solid" : "outline"}
                >
                  {item.label || item}
                </Button>
            ))
        ) : (
            <Box>
              <Text fontSize="sm" color="gray.500">
                No result
              </Text>
            </Box>
        )}
      </VStack>
  );
});

TypeList.displayName = "SuggestionList";

export { TypeList };

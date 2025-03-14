import parse, { Element } from "html-react-parser";

type MnemonicProps = { value: string };

export default function Mnemonic(props: MnemonicProps) {
  return <>{parseMnemonic(props.value)}</>;
}

function parseMnemonic(str: string) {
  return parse(str, {
    replace(domNode) {
      if (domNode instanceof Element) {
        switch (domNode.name) {
          case "reading":
            domNode.name = "span";
            domNode.attribs["class"] = "badge text-bg-secondary badge-reading";
            return domNode;
          case "kanji":
            domNode.name = "span";
            domNode.attribs["class"] = "badge badge-kanji";
            return domNode;
          case "radical":
            domNode.name = "span";
            domNode.attribs["class"] = "badge badge-radical";
            return domNode;
          case "vocabulary":
            domNode.name = "span";
            domNode.attribs["class"] = "badge badge-vocabulary";
            return domNode;
          case "ja":
            domNode.name = "span";
            return domNode;
        }
      }
    },
  });
}

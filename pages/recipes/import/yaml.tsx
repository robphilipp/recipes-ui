import {TextareaAutosize} from "@mui/material";
import {useState, JSX} from "react";

const initialYaml = `recipe:
  name: 
  tags:
    - tag1
    - tag2
  story: 
  author: 
  addedBy: 
  yield: 1 serving
  time:
    total: 1 minute
    active: 1 minute
  ingredients:
    - ingredient:
      amount: 1 piece
      name: 
      brand: 
  steps:
    - step:
      title: 
      step: 
  notes: 
`

export default function ImportRecipeYaml(): JSX.Element {

    const [yaml, setYaml] = useState(() => initialYaml)

    return (
        <TextareaAutosize
            value={yaml}
        />
    )
}
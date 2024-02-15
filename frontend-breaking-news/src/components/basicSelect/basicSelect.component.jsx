import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useEffect } from 'react';

export default function BasicSelect({ items = [], setParentValue, value= null }) {
  const [selectedOption, setSelectedOption] = React.useState('');

  useEffect(() => {
    if((items && items.length) && value !== null){
      setSelectedOption(value)
    }
  },[items, value])

  const handleChange = (event) => {
    setSelectedOption(event.props.value);
    setParentValue(event.props.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 'fit-content', display: 'flex', flexDirection: 'row-reverse' }} size="small">
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={selectedOption}
        onChange={(_,v) => {
          handleChange(v)
        }}
        sx={{ background: 'white', borderRadius: '8px', height: '34px', width: '13.5rem'}}
      >
        {
          items.map((v,i) => {
            return <MenuItem key={`${v}_${i}`} sx={{ minWidth: '13rem', position:'relative',padding: '5px 2rem 5px 2rem' }} value={v.value}>{v.name}</MenuItem>
          })
        }
      </Select>
    </FormControl>
  );
}

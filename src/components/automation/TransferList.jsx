import React, { useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import AutomationsContext from '../../context/automationsContext';


const useStyles = makeStyles((theme) => ({
  root: {
    margin: 'auto',
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    width: 200,
    height: 230,
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
}));

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

export default function TransferList() {
  const { left, right, setLeft, setRight, isEditing, automations } = useContext(AutomationsContext);
  const {
    getRandomKey, sort, setLoading, setIsError,
  } = useContext(AutomationsContext);

  const classes = useStyles();
  const [checked, setChecked] = React.useState([]);
  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  useEffect(() => {
    const host = `${window.location.protocol}//${window.location.hostname}:8080`;
    const scenesFetchUrl = `${host}/scenes`;
    const method = 'GET';
    const headers = {
      user: localStorage.getItem('username'),
      'session-token': localStorage.getItem('session_token'),
    };

    fetch(scenesFetchUrl, {
      method,
      headers,
    })
    .then((res) => {
      if (res.status === 200) {
        return res.text();
      }
      return null;
    })
    .then((data) => {
      const fetchedScenes = JSON.parse(data);

      if (fetchedScenes.length === 0) {
        setLoading(false);
        setIsError(false);
      } else {
        sort(fetchedScenes);
        setLoading(false);

        if (!isEditing) {
          setRight(fetchedScenes);
        }
        if (isEditing) {
          if (automations.scenes) {
            const usedScenes = fetchedScenes.filter((s) => s.id === automations.scenes.map((id) => id)[0]);
            const unusedScenes = fetchedScenes.filter((s) => s.id !== automations.scenes.map((id) => id)[0]);
            setLeft(usedScenes);
            setRight(unusedScenes);
          }
        }
      }
    })
    .catch((e) => {
      console.log(e);
      setLoading(false);
      setIsError(true);
    });
  }, [sort, setLeft, setRight, setIsError, setLoading, isEditing, automations]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items) => intersection(checked, items).length;

  const handleToggleAll = (items) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedLeft = () => {
    const leftScenes = left.concat(rightChecked);
    const rightScenes = not(right, rightChecked);

    leftScenes.forEach((device) => device.used = true);
    setRight(rightScenes);
    setLeft(leftScenes);
    setChecked(not(checked, rightChecked));
  };

  const handleCheckedRight = () => {
    const rightScenes = right.concat(leftChecked);
    const leftScenes = not(left, leftChecked);

    sort(rightScenes);
    rightScenes.forEach((device) => device.used = false);
    setRight(rightScenes);
    setLeft(leftScenes);
    setChecked(not(checked, leftChecked));
  };

  const customList = (title, items) => (
    <Card>
      <CardHeader
        className={classes.cardHeader}
        avatar={(
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
            disabled={items.length === 0}
            inputProps={{ 'aria-label': 'all items selected' }}
          />
        )}
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selected`}
      />
      <Divider />
      <List className={classes.list} dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-all-item-${value}-label`;

          return (
            <ListItem key={getRandomKey()} role="listitem" button onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value.name} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
      <Grid item>{customList('Chosen', left)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList('Not chosen', right)}</Grid>
    </Grid>
  );
}

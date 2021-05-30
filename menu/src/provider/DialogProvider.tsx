import React, {
  ChangeEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  makeStyles,
  TextField,
  Theme,
  useTheme,
} from "@material-ui/core";
import { Create } from "@material-ui/icons";
import { useKeyboardNavContext } from "./KeyboardNavProvider";
import { useSnackbar } from "notistack";
import { useTranslate } from "react-polyglot";
import { useSetDisableTab } from "../state/tab.state";
import { txAdminMenuPage, usePageValue } from "../state/page.state";

interface InputDialogProps {
  title: string;
  description: string;
  placeholder: string;
  onSubmit: (inputValue: string) => void;
  isMultiline?: boolean;
}

interface DialogProviderContext {
  openDialog: (dialogProps: InputDialogProps) => void;
  closeDialog: () => void;
  isDialogOpen: boolean
}

const DialogContext = createContext(null);

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    color: theme.palette.text.secondary,
  },
  dialogTitleOverride: {
    color: theme.palette.primary.main,
  },
}));

const defaultDialogState = {
  description: "This is the default description for whatever",
  placeholder: "This is the default placeholder...",
  onSubmit: () => {},
  title: "Dialog Title",
};

export const DialogProvider: React.FC = ({ children }) => {
  const classes = useStyles();

  const theme = useTheme();

  const setDisableTabs = useSetDisableTab()

  const [dialogOpen, setDialogOpen] = useState(false);

  const [dialogProps, setDialogProps] = useState<InputDialogProps>(
    defaultDialogState
  );

  const { setDisabledKeyNav } = useKeyboardNavContext();

  const [dialogInputVal, setDialogInputVal] = useState<string>("");

  const { enqueueSnackbar } = useSnackbar();

  const curPage = usePageValue()

  const t = useTranslate();

  useEffect(() => {
    if (curPage === txAdminMenuPage.Main) {
      setDisabledKeyNav(dialogOpen);
      setDisableTabs(dialogOpen)
    }
  }, [dialogOpen, setDisabledKeyNav, setDisableTabs]);

  const handleDialogSubmit = () => {

    if (!dialogInputVal.trim()) {
      return enqueueSnackbar("You cannot have an empty input", { variant: "error" });
    }

    dialogProps.onSubmit(dialogInputVal);

    setDialogOpen(false);
    setDialogInputVal("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDialogInputVal(e.target.value);
  };

  const openDialog = useCallback((dialogProps: InputDialogProps) => {
    setDialogProps(dialogProps);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
  }, []);

  // We reset default state after the animation is complete
  const handleOnExited = () => {
    setDialogProps(defaultDialogState)
  }

  return (
    <DialogContext.Provider
      value={{
        openDialog,
        closeDialog: handleDialogClose,
        isDialogOpen: dialogOpen
      }}
    >
      <Dialog
        onEscapeKeyDown={handleDialogClose}
        open={dialogOpen}
        onExited={handleOnExited}
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDialogSubmit();
          }}
        >
          <DialogTitle classes={{ root: classes.dialogTitleOverride }}>
            {dialogProps.title}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>{dialogProps.description}</DialogContentText>
            <TextField
              variant="standard"
              autoFocus
              fullWidth
              multiline={dialogProps?.isMultiline}
              id="dialog-input"
              placeholder={dialogProps.placeholder}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Create className={classes.icon} color="inherit" />
                  </InputAdornment>
                ),
              }}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDialogClose}
              style={{
                color: theme.palette.text.secondary,
              }}
            >
              {t("nui_menu.common.cancel")}
            </Button>
            <Button type="submit" color="primary">
              {t("nui_menu.common.submit")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialogContext = () =>
  useContext<DialogProviderContext>(DialogContext);

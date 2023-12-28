import {UserWithPermissions} from "../../../lib/recipes";
import {Divider, List, ListItem, ListItemText, Typography} from "@mui/material";
import {accessRightArrayFrom, AccessRights} from "../RecipePermissions";

type Props = {
    users: Array<UserWithPermissions>
    showRole?: boolean
}

export default function RecipeUsersView(props: Props): JSX.Element {
    const {users, showRole = true} = props
    return (
        <List sx={{width: '100%', bgcolor: 'background.paper', maxHeight: 150}}>
            {users.map(user => (
                <>
                    <Divider component="li"/>
                    <ListItem alignItems="flex-start">
                        <ListItemText
                            key={user.email}
                            primary={<>
                                {user.name}
                                <Typography
                                    sx={{display: 'inline', fontSize: '0.8em'}}
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    <span style={{paddingLeft: 15}}>{showRole ? ` (${user.role.description})` : ""}</span>
                                </Typography>
                                <Divider component="br"/>
                                <Typography
                                    sx={{display: 'inline', fontSize: '0.8em'}}
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    ({renderAccessRights(user.accessRights)})
                                </Typography>
                            </>}
                            secondary={<div style={{paddingTop: 7}}>
                                <Typography
                                    sx={{display: 'inline'}}
                                    component="div"
                                    variant="body2"
                                    color="text.primary"
                                >
                                    {user.email}
                                </Typography>
                            </div>}
                        />
                    </ListItem>
                </>
            ))}
        </List>
    )
}

function renderAccessRights(rights: AccessRights): string {
    const access: Array<string> = []
    if (rights.read) access.push("Read")
    if (rights.update) access.push("Update")
    if (rights.delete) access.push("Delete")
    return access.join(", ")
}
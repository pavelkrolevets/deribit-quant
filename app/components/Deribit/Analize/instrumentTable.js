import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";

function getSorting(order, orderBy) {
  return order === "desc"
    ? (a, b) => (a[orderBy] > b[orderBy] ? -1 : 1)
    : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
}

class GroupedTable extends React.Component {
  state = {
    groupBy: "city",
    sortBy: "",
    sortOrder: "asc",
    expandedGroups: ["Las Vegas"]
  };

  getColumnData = columns => {
    return columns.filter(item => item.dataKey !== this.state.groupBy);
  };

  getGroupedData = rows => {
    const groupedData = rows.reduce((acc, item) => {
      let key = item[this.state.groupBy];
      let groupData = acc[key] || [];
      acc[key] = groupData.concat([item]);
      return acc;
    }, {});

    const expandedGroups = {};
    const { sortBy, sortOrder } = this.state;
    Object.keys(groupedData).forEach(item => {
      expandedGroups[item] = this.state.expandedGroups.indexOf(item) !== -1;
      groupedData[item] = groupedData[item].sort(getSorting(sortOrder, sortBy));
    });

    this.groups = expandedGroups;
    return groupedData;
  };

  handleRequestSort = property => {
    const sortBy = property;
    let sortOrder = "desc";

    if (this.state.sortBy === property && this.state.sortOrder === "desc") {
      sortOrder = "asc";
    }

    this.setState({ sortOrder, sortBy });
  };

  expandRow = groupVal => {
    const curr = this.groups[groupVal];
    let expandedGroups = this.state.expandedGroups;
    if (curr) {
      expandedGroups = expandedGroups.filter(item => item !== groupVal);
    } else {
      if (expandedGroups.indexOf(groupVal) === -1) {
        //Maintain all open groups ever!!
        expandedGroups = expandedGroups.concat([groupVal]);
      }
    }
    this.setState({ expandedGroups });
  };

  render() {
    let { rows, columns } = this.props;
    let columnData = this.getColumnData(columns);
    let groupedData = this.getGroupedData(rows);
    let { sortBy, sortOrder } = this.state;
    return (
      <Table>
        <TableHead>
          <TableRow>
            {columnData.map(item => (
              <TableCell>
                <TableSortLabel
                  active={sortBy === item.dataKey}
                  direction={sortOrder}
                  onClick={this.handleRequestSort.bind(null, item.dataKey)}
                >
                  {item.title}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(groupedData).map(key => {
            return (
              <React.Fragment>
                <TableRow>
                  <TableCell
                    colSpan={columnData.length}
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                    onClick={this.expandRow.bind(null, key)}
                  >
                    {/*<IconButton>*/}
                      {/*<Icon>*/}
                        {/*{this.groups[key] ? "ExpandMore" : "ChevronRight"}*/}
                      {/*</Icon>*/}
                    {/*</IconButton>*/}
                    <span>{key}</span>
                  </TableCell>
                </TableRow>
                {this.groups[key] &&
                groupedData[key].map(item => (
                  <TableRow>
                    {columnData.map(col => (
                      <TableCell>{item[col.dataKey]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    );
  }
}

export default GroupedTable;

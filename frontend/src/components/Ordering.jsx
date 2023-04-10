import PropTypes from "prop-types";
import { useEffect, useState } from "react";

export default function Ordering({
  searchFilters,
  setSearchFilters,
  orderElements,
  executor,
}) {
  const [orderBy, setOrderBy] = useState([0]);
  const [order, setOrder] = useState([0]);
  const handleClick = (e) => {
    const idOrder = parseInt(e.target.value, 10);
    if (orderBy.includes(idOrder)) {
      setSearchFilters((searchParams) => {
        const index = orderBy.indexOf(idOrder);
        const value = !order[index];
        let newOrder = [...order];
        if (!value) {
          newOrder.splice(index, 1);
          let newOrderBy = [...orderBy];
          newOrderBy.splice(index, 1);
          if (newOrderBy.filter((el) => !Number.isNaN(el)).length === 0) {
            newOrderBy = [];
            newOrder = [];
          }
          if (orderBy.filter((el) => !Number.isNaN(el)).length)
            searchParams.set(
              "order_by",
              newOrderBy.filter((el) => !Number.isNaN(el)).join(",")
            );
          else searchParams.delete("order_by");
          setOrderBy(newOrderBy);
        } else {
          newOrder[index] = value ? 1 : 0;
          searchParams.set(
            "order_by",
            orderBy.filter((el) => !Number.isNaN(el)).join(",")
          );
        }
        if (orderBy.filter((el) => !Number.isNaN(el)).length)
          searchParams.set(
            "order",
            newOrder.filter((el) => !Number.isNaN(el)).join(",")
          );
        else searchParams.delete("order");
        setOrder(newOrder);
        return searchParams;
      });
    } else {
      const newOrderBy = [...orderBy, idOrder];
      const newOrders = [...order, 0];
      setOrderBy(newOrderBy);
      setOrder(newOrders);
      setSearchFilters((searchParams) => {
        searchParams.set(
          "order",
          newOrders.filter((el) => !Number.isNaN(el)).join(",")
        );
        searchParams.set(
          "order_by",
          newOrderBy.filter((el) => !Number.isNaN(el)).join(",")
        );
        return searchParams;
      });
    }
    if (executor) executor();
  };
  useEffect(() => {
    const filterOrderBy = searchFilters
      .get("order_by")
      ?.split(",")
      .map((e) => parseInt(e, 10)) || [0];
    const filterOrders = searchFilters
      .get("order")
      ?.split(",")
      .map((e) => parseInt(e, 10)) || [0];
    setOrderBy(filterOrderBy);
    setOrder(filterOrders);
  }, [searchFilters.get("order_by"), searchFilters.get("order")]);
  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      {orderElements.map((element, i) => (
        <span key={element}>
          <h6 className="d-inline">
            <button
              type="button"
              className="btn btn-link"
              onClick={handleClick}
              value={i}
            >
              {element} &nbsp;{" "}
              {orderBy.includes(i) ? (
                <i
                  className={`${
                    order[orderBy.indexOf(i)]
                      ? "icons-arrow-down"
                      : "icons-arrow-up"
                  } mr-2`}
                  aria-hidden="true"
                />
              ) : (
                ""
              )}
            </button>
          </h6>
          &nbsp; &nbsp;
        </span>
      ))}
    </div>
  );
}
Ordering.propTypes = {
  searchFilters: PropTypes.instanceOf(URLSearchParams).isRequired,
  setSearchFilters: PropTypes.func.isRequired,
  orderElements: PropTypes.arrayOf(PropTypes.string).isRequired,
  executor: PropTypes.func,
};
Ordering.defaultProps = {
  executor: null,
};

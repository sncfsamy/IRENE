import PropTypes from "prop-types";
import { useEffect, useState } from "react";

export default function Pagination({ searchFilters, setSearchFilters, total }) {
  const [totalPages, setTotalPage] = useState(
    Math.ceil(total / searchFilters.get("limit") ?? 20)
  );
  const [paginationButtons, setPaginationButtons] = useState([]);
  const maxPaginationButtons = 5;
  useEffect(() => {
    const limit = parseInt(searchFilters.get("limit") ?? 20, 10);
    const page = parseInt(searchFilters.get("page") ?? 1, 10);
    const newTotal = Math.ceil(total / limit);
    setTotalPage(newTotal);
    const paginationButtonsArray = [];
    const numberPaginationButtonsMoreAndLess = Math.floor(
      (maxPaginationButtons - 1) / 2
    );
    let lastPageShowedInPagination =
      page + numberPaginationButtonsMoreAndLess <= newTotal
        ? page + numberPaginationButtonsMoreAndLess
        : newTotal;
    let firstPageShowedInPagination =
      page - numberPaginationButtonsMoreAndLess >= 1
        ? page - numberPaginationButtonsMoreAndLess
        : 1;
    while (
      lastPageShowedInPagination - firstPageShowedInPagination <
        maxPaginationButtons &&
      newTotal > lastPageShowedInPagination
    ) {
      if (firstPageShowedInPagination > 1) {
        firstPageShowedInPagination -= 1;
      } else if (lastPageShowedInPagination < newTotal) {
        lastPageShowedInPagination += 1;
      }
    }
    for (
      let i = firstPageShowedInPagination;
      i <= lastPageShowedInPagination;
      i += 1
    ) {
      paginationButtonsArray.push(
        <li
          key={`p${i}`}
          className={`page-item ${
            parseInt(searchFilters.get("page"), 10) === i ? "active" : ""
          }`}
        >
          <button
            type="button"
            className="page-link"
            onClick={() =>
              parseInt(searchFilters.get("page"), 10) !== i &&
              setSearchFilters((searchParams) => {
                searchParams.set("page", i);
                return searchParams;
              })
            }
          >
            {i}
          </button>
        </li>
      );
    }
    setPaginationButtons(paginationButtonsArray);
  }, [total, searchFilters]);
  return (
    <nav role="navigation" className="mt-4" aria-label="Pagination">
      <div className="w-100 text-center">
        Elements: {total.toLocaleString("en").replace(/,/g, " ")} &nbsp; &nbsp; Pages:{" "}
        {totalPages.toLocaleString("en").replace(/,/g, " ")}
      </div>
      <ul className="pagination justify-content-center">
        <li
          className={`page-item page-skip ${
            parseInt(searchFilters.get("page"), 10) === 1 ? "disabled" : ""
          }`}
        >
          <button
            type="button"
            className="page-link"
            onClick={() =>
              parseInt(searchFilters.get("page"), 10) !== 1 &&
              setSearchFilters((searchParams) => {
                searchParams.set("page", 1);
                return searchParams;
              })
            }
          >
            <i
              className="icons-arrow-double icons-rotate-180 icons-size-x5"
              aria-hidden="true"
            />
            <span className="d-none d-sm-inline ml-2">Début</span>
          </button>
        </li>
        <li
          className={`page-item page-skip ${
            parseInt(searchFilters.get("page"), 10) === 1 ? "disabled" : ""
          }`}
        >
          <button
            type="button"
            className="page-link"
            onClick={() =>
              parseInt(searchFilters.get("page"), 10) !== 1 &&
              setSearchFilters((searchParams) => {
                searchParams.set(
                  "page",
                  parseInt(searchFilters.get("page"), 10) - 1 >= 1
                    ? parseInt(searchFilters.get("page"), 10) - 1
                    : 1
                );
                return searchParams;
              })
            }
          >
            <i className="icons-arrow-prev icons-size-x5" aria-hidden="true" />
            <span className="d-none d-sm-inline ml-2">Précédent</span>
          </button>
        </li>
        {paginationButtons.map((p) => p)}
        <li
          className={`page-item page-skip ${
            parseInt(searchFilters.get("page"), 10) === totalPages ||
            totalPages <= 1
              ? "disabled"
              : ""
          }`}
        >
          <button
            type="button"
            className="page-link"
            onClick={() =>
              totalPages > 1 &&
              totalPages !== parseInt(searchFilters.get("page"), 10) &&
              setSearchFilters((searchParams) => {
                searchParams.set(
                  "page",
                  parseInt(searchFilters.get("page"), 10) + 1 <= totalPages
                    ? parseInt(searchFilters.get("page"), 10) + 1
                    : totalPages
                );
                return searchParams;
              })
            }
          >
            <span className="d-none d-sm-inline mr-2">Suivant</span>
            <i className="icons-arrow-next icons-size-x5" aria-hidden="true" />
          </button>
        </li>
        <li
          className={`page-item page-skip ${
            parseInt(searchFilters.get("page"), 10) === totalPages ||
            totalPages <= 1
              ? "disabled"
              : ""
          }`}
        >
          <button
            type="button"
            className="page-link"
            onClick={() =>
              totalPages > 1 &&
              totalPages !== parseInt(searchFilters.get("page"), 10) &&
              setSearchFilters((searchParams) => {
                searchParams.set("page", totalPages);
                return searchParams;
              })
            }
          >
            <span className="d-none d-sm-inline mr-2">Fin</span>
            <i
              className="icons-arrow-double icons-size-x5"
              aria-hidden="true"
            />
          </button>
        </li>
      </ul>
    </nav>
  );
}

Pagination.propTypes = {
  searchFilters: PropTypes.instanceOf(URLSearchParams).isRequired,
  setSearchFilters: PropTypes.func,
  total: PropTypes.number,
};

Pagination.defaultProps = {
  setSearchFilters: null,
  total: 0,
};

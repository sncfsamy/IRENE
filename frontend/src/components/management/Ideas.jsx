import PropTypes from "prop-types";
import IdeaList from "@components/IdeasList";
import { useContext, useEffect, useState } from "react";
import Pagination from "@components/Pagination";
import SharedContext from "../../contexts/sharedContext";

export default function Ideas({
  page,
  setSelected,
  setSelectedToDelete,
  selected,
  addRemoveCallback,
  searchFilters,
  setSearchFilters,
}) {
  const { user, setIsLoading, customFetch, darkMode, isLoading } =
    useContext(SharedContext);
  const [notification, setNotification] = useState();
  const [ideasData, setIdeasData] = useState({ ideas: [], authors: [] });
  const getIdeaData = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (page === "ambassador") {
      params.set("organisations", user.id_organisation);
    }
    if (page === "manager") {
      params.set("teams", user.id_team);
    }
    searchFilters.forEach((value, key) => params.set(key, value));
    params.set("limit", Math.min(searchFilters.get("limit") ?? 20, 100));
    params.set(
      "order_by",
      searchFilters.has("order_by") ? searchFilters.get("order_by") : 0
    );
    params.set(
      "order",
      searchFilters.has("order") ? searchFilters.get("order") : 0
    );
    customFetch(`${import.meta.env.VITE_BACKEND_URL}/ideas?${params}`)
      .then((data) => {
        setIdeasData(data);
        setIsLoading(false);
        clearTimeout(window.loadTimeout);
        window.loadTimeout = undefined;
      })
      .catch((err) => {
        console.warn(err);
        setIsLoading(false);
        clearTimeout(window.loadTimeout);
        window.loadTimeout = undefined;
      });
  };
  useEffect(() => {
    if (window.loadTimeout) {
      clearTimeout(window.loadTimeout);
    }
    window.loadTimeout = setTimeout(
      (incPage) => {
        if (page === incPage) {
          getIdeaData();
        }
      },
      !searchFilters.get("search_terms") ? 0 : 600,
      page
    );
    return () => {
      clearTimeout(window.loadTimeout);
      window.loadTimeout = undefined;
    };
  }, [page, searchFilters.get("search_terms"), searchFilters.get("page")]);

  useEffect(() => {
    $("#actionModal").on("hidden.bs.modal", () => {
      if (!isLoading) {
        setNotification();
      }
    });
    addRemoveCallback("ideas", (deletedIds) => {
      if (deletedIds.length) {
        setNotification({
          success: true,
          deleted: deletedIds.length,
        });
        getIdeaData();
      } else {
        setNotification({});
      }
    });
  }, []);
  return (
    <section>
      <p
        className={`text-${
          darkMode === 0 && notification && notification.success
            ? "warning"
            : ""
        }${
          darkMode !== 0 && notification && notification.success
            ? "primary"
            : ""
        }${
          notification && !notification.success ? "danger" : ""
        } pl-4 pt-2 pb-2 font-weight-medium`}
        style={{ minHeight: "20px" }}
      >
        {notification
          ? `${
              notification.success ? (
                <>
                  <i className="icons-checked mr-2" aria-hidden="true" />
                  Suppression de {notification.deleted} innovation
                  {notification.deleted > 1 ? "s" : ""} effectuée
                </>
              ) : (
                "Echec de la suppression"
              )
            }`
          : ""}
      </p>
      <Pagination
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        total={ideasData.total || 0}
      />
      <IdeaList
        ideas={ideasData.ideas}
        authors={ideasData.authors}
        setSelected={setSelected}
        setSelectedToDelete={setSelectedToDelete}
        selected={selected}
      />
      <Pagination
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        total={ideasData.total || 0}
      />
    </section>
  );
}
Ideas.propTypes = {
  page: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  setSelectedToDelete: PropTypes.func,
  addRemoveCallback: PropTypes.func,
  searchFilters: PropTypes.instanceOf(URLSearchParams).isRequired,
  setSearchFilters: PropTypes.func,
  selected: PropTypes.arrayOf(PropTypes.number),
  setSelected: PropTypes.func,
};
Ideas.defaultProps = {
  page: 1,
  selected: [],
  setSelected: null,
  setSelectedToDelete: null,
  addRemoveCallback: null,
  setSearchFilters: null,
};

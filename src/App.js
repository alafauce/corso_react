import React from "react";
import "./styles.css";

const FINES = [
  { id: 1, reason: "Eccesso di velocità", plate: "88 XYZ 00" },
  { id: 2, reason: "Passaggio con rosso", plate: "88 XYZ 00" },
  { id: 3, reason: "Mancato uso del casco", plate: "88 XYZ 00" }
];

const CHECKBOX_EMPTY = "[_]";
const CHECKBOX_INDETERMINATE = "[-]";
const CHECKBOX_FULL = "[X]";

async function fetchFines(plate) {
  await new Promise(resolve => setTimeout(resolve, 5000));
  if (!plate) return FINES;

  return FINES.filter(fine => fine.plate === plate);
}

export default function App() {
  const [fines, setFines] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let ignore = false;
    fetchFines()
      .then(fines => {
        if (!ignore) {
          setFines(fines);
          setError(error);
        }
      })
      .catch(error => {
        if (!ignore) setError(error);
      });

    return () => {
      ignore = true;
    };
  }, [error]);

  const [selection, setSelection] = React.useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("selection")) || {};
    } catch (e) {
      return {};
    }
  }); //viene passata una fuzione per farlo fare una sola volta a react (migliore prestazioni)
  //se venisse passata direttamente il blocco d'istruzioni sarebbe eseguita ogni volta alla creazione del componente

  React.useEffect(() => {
    window.localStorage.setItem("selection", JSON.stringify(selection));
  }, [selection]); //si passa secondo parametro per aggiornare solo le variabili libere
  //Effetto react: si chiede a react di avere un effetto collaterale, react mette in coda l'effetto per ottimizzare i render continui

  React.useEffect(() => {
    function listner(event) {
      //console.log("Listner!");
      if (event.key === "selection") {
        setSelection(JSON.parse(event.newValue));
      }
    }
    window.addEventListener("storage", listner);

    return () => {
      window.removeEventListener("storage", listner);
    };
  }, []); //si passa secondo parametro per aggiornare solo le variabili libere

  const allSelected = fines && fines.every(fine => selection[fine.id]);
  const noSelected = fines && fines.every(fine => !selection[fine.id]);

  function handleSelectAllClick(event) {
    if (allSelected) {
      setSelection({});
    } else {
      const nextSelection = {};
      for (let fine of fines) {
        nextSelection[fine.id] = true;
      }
      setSelection(nextSelection);
    }
  }

  if (fines === null) return "Loading...";

  return (
    <table>
      <thead>
        <tr>
          <th onClick={handleSelectAllClick}>
            {allSelected
              ? CHECKBOX_FULL
              : noSelected
              ? CHECKBOX_EMPTY
              : CHECKBOX_INDETERMINATE}
          </th>
          <th>ID</th>
          <th>Targa</th>
          <th>Ragione</th>
        </tr>
      </thead>
      <tbody>
        {fines.map(fine => (
          <FineRow
            key={fine.id}
            fine={fine}
            selected={Boolean(selection[fine.id])} //Si esegue cast perchè potrebbe arrivare undefined
            onToggle={event => {
              setSelection(selection => ({
                ...selection,
                [fine.id]: !selection[fine.id]
              })); //IMPORTANTE:Si trasforma in una funzione per renderlo "sincronyzed" in quanto setSelection dipende da selection mutato
            }}
          />
        ))}
      </tbody>
    </table>
  );
}

//Quando si porta lo stato allo strato superiore si mette come props il vecchio stato interno e su l'evento onclick mettiamo in ascolto un evento onToggle
function FineRow({ fine, selected, onToggle }) {
  return (
    <tr>
      <td onClick={onToggle}>{selected ? CHECKBOX_FULL : CHECKBOX_EMPTY}</td>
      <td>{fine.id}</td>
      <td>{fine.plate}</td>
      <td>
        <Fieldset>{fine.reason}</Fieldset>
      </td>
    </tr>
  );
}

//Uso delle props.children
function Fieldset(props) {
  return <div style={{ border: "2px solid red" }}>{props.children}</div>;
}

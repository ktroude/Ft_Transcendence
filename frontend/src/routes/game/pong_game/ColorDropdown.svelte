<script>
  let selectedColor = '';

  function handleChange(event) {
    selectedColor = event.target.value;
    //console.log('Couleur sélectionnée :', selectedColor);
    // Vous pouvez exécuter d'autres actions en fonction de la sélection
  }
</script>

<h1>Choisissez une couleur :</h1>

<label for="couleur">Couleur :</label>
<select id="couleur" on:change={handleChange}>
  <option value="">Sélectionnez une couleur</option>
  <option value="rouge">Rouge</option>
  <option value="vert">Vert</option>
  <option value="bleu">Bleu</option>
  <option value="jaune">Jaune</option>
</select>

<p>Vous avez sélectionné la couleur : {selectedColor}</p>
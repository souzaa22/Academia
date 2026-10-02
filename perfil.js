document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    
    // Inputs do formulário
    const nameInput = document.getElementById('profile-name');
    const heightInput = document.getElementById('profile-height');
    const weightInput = document.getElementById('profile-weight');
    const goalWeightInput = document.getElementById('profile-goal-weight');
    const caloriesInput = document.getElementById('profile-calories');

    // Elementos do ecrã
    const userNameDisplay = document.getElementById('user-display-name');
    const avatarInitial = document.getElementById('avatar-initial');
    const displayImc = document.getElementById('display-imc');
    const displayHeight = document.getElementById('display-height');
    const displayCalories = document.getElementById('display-calories');

    // Carrega dados salvos do utilizador
    function loadProfile() {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');

        if (profile.name) {
            nameInput.value = profile.name;
            if (userNameDisplay) userNameDisplay.textContent = profile.name;
            if (avatarInitial) avatarInitial.textContent = profile.name.charAt(0).toUpperCase();
        }

        if (profile.height) {
            heightInput.value = profile.height;
            if (displayHeight) displayHeight.textContent = `${profile.height} cm`;
        }

        if (profile.weight) weightInput.value = profile.weight;
        if (profile.goalWeight) goalWeightInput.value = profile.goalWeight;

        if (profile.calories) {
            caloriesInput.value = profile.calories;
            if (displayCalories) displayCalories.textContent = `${profile.calories} kcal`;
        }

        // Cálculo de IMC caso exista altura e peso registrados
        if (profile.height && profile.weight) {
            const heightInMeters = profile.height / 100;
            const imc = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
            if (displayImc) displayImc.textContent = `${imc} kg/m²`;
        }
    }

    // Salva as atualizações do formulário
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const profileData = {
                name: nameInput.value.trim(),
                height: parseFloat(heightInput.value),
                weight: parseFloat(weightInput.value),
                goalWeight: parseFloat(goalWeightInput.value),
                calories: parseInt(caloriesInput.value, 10)
            };

            localStorage.setItem('userProfile', JSON.stringify(profileData));
            alert('Perfil atualizado com sucesso!');
            loadProfile();
        });
    }

    loadProfile();
});
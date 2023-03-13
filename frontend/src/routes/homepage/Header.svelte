<style>
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: fixed;
        top: 0;
        left: 0;
        background-color: #8FBC8F;
        width: 100%;
        border-bottom: 1px solid #ccc;
        justify-content: center;
    }
    button {
        background-color: green;
        border: red;
        color: white;
        padding: 10px 20px;
        text-align: right;
        text-decoration: none;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.3s ease-in-out ;
    }
    button:hover {
        background-color: #6a737d;
    }
    .header-title{
        margin: 0;
        padding: 0;
        font-size: 40px;
        color: white;
        text-align: center;
        margin-left: 70px;
        width: 100%;
        font-family: Lobster;
        color: #DAA520; /* Couleur orange du logo Dofus */
        text-shadow: 3px 3px 0 black; /* Ombre du logo Dofus */
    }
    .right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-left: auto;
    }
</style>
<head>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lobster">
</head>
<header>
    <div class="header-title">Ft_Transcendence</div>
    <div class="right">
        <button><a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ad63634a67eaff34218824a7796fa6e5c5337b11f88c026df3956ba7a8f38dc6&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fhomepage&response_type=code" style="color: white; text-decoration: none;">Login</a></button>
    </div>
</header>

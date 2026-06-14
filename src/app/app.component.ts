import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as DATA from '../../public/data.json';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  lang = 'fr';

  // ---- Donnees editables de la planche --------------------------------------
  services: any;
  textes: any;
  phrase: any;
  titres: any;
  footer: any;
  images: any;
  positions: any;
  layout: any;

  // Images de fleurs disponibles dans /public (suggestions des menus).
  flowerOptions = [
    'tulipe', 'camelia', 'jasmin', 'pivoine', 'rose', 'anemone', 'gypsophile',
  ];
  backgroundOptions = ['fond.jpg', 'fond2.jpg', 'fond3.jpg'];

  // Libelles d'aide pour l'editeur.
  titreLabels = [
    'Titre forfaits mariees',
    'Titre forfaits invitees',
    'Titre options',
    'Encart « kit inclus »',
  ];
  positionFields = [
    { key: 'prestas', label: 'Bloc principal (toute la zone)' },
    { key: 'titreMariees', label: 'Titre forfaits mariees' },
    { key: 'kit', label: 'Encart « kit inclus »' },
    { key: 'titreInvitees', label: 'Titre forfaits invitees' },
    { key: 'phrase', label: 'Phrase en italique' },
    { key: 'titreOptions', label: 'Titre options' },
    { key: 'textes', label: 'Bloc des conditions (textes)' },
    { key: 'footer', label: 'Pied de page' },
  ];

  // ---- Etat editeur / administration ----------------------------------------
  showEditor = false;
  isAdmin = false;
  token: string | null = null;
  password = '';
  loginError = '';
  loggingIn = false;

  // ---- Etat chargement / sauvegarde -----------------------------------------
  loading = true;
  saving = false;
  statusMsg = '';
  statusOk = true;
  lastUpdated: string | null = null;

  constructor(private dataService: DataService) {
    // Valeurs par defaut (embarquees dans l'application) en attendant le serveur.
    this.applyData(null);
  }

  ngOnInit() {
    const t = localStorage.getItem('planche_token');
    if (t) {
      this.token = t;
      this.isAdmin = true;
    }
    this.loadFromServer();
  }

  // ---------------------------------------------------------------------------
  //  Chargement / fusion des donnees
  // ---------------------------------------------------------------------------
  private base(): any {
    const D: any = DATA;
    return JSON.parse(
      JSON.stringify({
        services: D.services,
        textes: D.textes,
        phrase: D.phrase,
        titres: D.titres,
        footer: D.footer,
        images: D.images,
        positions: D.positions,
        layout: D.layout,
      })
    );
  }

  private isObj(v: any): boolean {
    return v && typeof v === 'object' && !Array.isArray(v);
  }

  // Fusionne les donnees du serveur par-dessus les valeurs par defaut : les
  // tableaux (forfaits, textes...) sont remplaces, les objets completes. Cela
  // permet d'ajouter de nouveaux champs sans casser les anciennes sauvegardes.
  private deepMerge(base: any, over: any): any {
    if (over === undefined || over === null) return base;
    if (!this.isObj(base) || !this.isObj(over)) return over;
    const out: any = { ...base };
    for (const k of Object.keys(over)) {
      out[k] = this.deepMerge(base[k], over[k]);
    }
    return out;
  }

  private applyData(loaded: any) {
    const merged = this.deepMerge(this.base(), loaded || {});
    this.services = merged.services;
    this.textes = merged.textes;
    this.phrase = merged.phrase;
    this.titres = merged.titres;
    this.footer = merged.footer;
    this.images = merged.images;
    this.positions = merged.positions;
    this.layout = merged.layout;
  }

  private buildData(): any {
    return {
      services: this.services,
      textes: this.textes,
      phrase: this.phrase,
      titres: this.titres,
      footer: this.footer,
      images: this.images,
      positions: this.positions,
      layout: this.layout,
    };
  }

  loadFromServer() {
    this.loading = true;
    this.dataService.load().subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.ok && res.data) {
          this.applyData(res.data);
          this.lastUpdated = res.updated_at;
        }
      },
      error: () => {
        // Serveur indisponible : on garde les valeurs par defaut embarquees.
        this.loading = false;
      },
    });
  }

  // ---------------------------------------------------------------------------
  //  Authentification
  // ---------------------------------------------------------------------------
  login() {
    this.loginError = '';
    this.loggingIn = true;
    this.dataService.login(this.password).subscribe({
      next: (res) => {
        this.loggingIn = false;
        if (res && res.ok && res.token) {
          this.token = res.token;
          this.isAdmin = true;
          localStorage.setItem('planche_token', res.token);
          this.password = '';
        } else {
          this.loginError = (res && res.error) || 'Mot de passe incorrect.';
        }
      },
      error: (e) => {
        this.loggingIn = false;
        this.loginError =
          (e && e.error && e.error.error) || 'Connexion au serveur impossible.';
      },
    });
  }

  logout() {
    this.token = null;
    this.isAdmin = false;
    localStorage.removeItem('planche_token');
  }

  // ---------------------------------------------------------------------------
  //  Sauvegarde
  // ---------------------------------------------------------------------------
  save() {
    if (!this.token) {
      this.setStatus('Veuillez vous connecter.', false);
      return;
    }
    this.saving = true;
    this.setStatus('Enregistrement…', true);
    this.dataService.save(this.buildData(), this.token).subscribe({
      next: (res) => {
        this.saving = false;
        if (res && res.ok) {
          this.lastUpdated = res.updated_at || null;
          this.setStatus('Enregistre ✓', true);
        } else {
          this.setStatus((res && res.error) || 'Echec de l’enregistrement.', false);
        }
      },
      error: (e) => {
        this.saving = false;
        if (e && e.status === 401) {
          this.setStatus('Session expiree, reconnectez-vous.', false);
          this.logout();
        } else {
          this.setStatus(
            (e && e.error && e.error.error) || 'Echec de l’enregistrement.',
            false
          );
        }
      },
    });
  }

  private setStatus(msg: string, ok: boolean) {
    this.statusMsg = msg;
    this.statusOk = ok;
  }

  // ---------------------------------------------------------------------------
  //  Televersement d'image -> ecrit l'URL renvoyee dans obj[key]
  // ---------------------------------------------------------------------------
  uploadImage(event: Event, obj: any, key: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    if (!this.token) {
      this.setStatus('Connectez-vous pour televerser une image.', false);
      input.value = '';
      return;
    }
    this.setStatus('Televersement…', true);
    this.dataService.upload(file, this.token).subscribe({
      next: (res) => {
        if (res && res.ok && res.url) {
          obj[key] = res.url;
          this.setStatus('Image televersee ✓', true);
        } else {
          this.setStatus((res && res.error) || 'Echec du televersement.', false);
        }
        input.value = '';
      },
      error: (e) => {
        this.setStatus(
          (e && e.error && e.error.error) || 'Echec du televersement.',
          false
        );
        input.value = '';
      },
    });
  }

  // ---------------------------------------------------------------------------
  //  Aides d'affichage
  // ---------------------------------------------------------------------------
  // Resout une reference d'image : URL complete, fichier avec extension, ou
  // ancienne convention "clef de fleur" -> "fleur.png".
  imgSrc(ref: string, fallback = ''): string {
    const v = (ref ?? '').toString().trim();
    if (!v) return fallback;
    if (/^(https?:)?\/\//.test(v) || v.startsWith('/') || v.startsWith('data:')) {
      return v;
    }
    if (/\.(png|jpe?g|webp|gif|svg)$/i.test(v)) return v;
    return v + '.png';
  }

  // Transforme un offset {x, y} en valeur CSS translate().
  trans(p: any): string {
    if (!p) return 'none';
    const x = +p.x || 0;
    const y = +p.y || 0;
    return x || y ? `translate(${x}px, ${y}px)` : 'none';
  }

  // ---------------------------------------------------------------------------
  //  Gestion des forfaits (mariees / invitees) — synchronise FR et EN
  // ---------------------------------------------------------------------------
  addService(group: string) {
    const fr = ['0€', 'rose', 'Nouveau forfait', 'Sous-titre', '', ''];
    const en = ['0€', 'rose', 'New package', 'Subtitle', '', ''];
    this.services[group].fr.push([...fr]);
    this.services[group].en.push([...en]);
  }

  removeService(group: string, i: number) {
    if (!confirm('Supprimer ce forfait ?')) return;
    this.services[group].fr.splice(i, 1);
    this.services[group].en.splice(i, 1);
    if (group === 'mariees' && this.layout.mariesBigIndex >= this.services.mariees.fr.length) {
      this.layout.mariesBigIndex = -1;
    }
  }

  moveService(group: string, i: number, dir: number) {
    const j = i + dir;
    if (j < 0 || j >= this.services[group].fr.length) return;
    for (const l of ['fr', 'en']) {
      const a = this.services[group][l];
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  setBig(i: number) {
    this.layout.mariesBigIndex = this.layout.mariesBigIndex === i ? -1 : i;
  }

  // ---- Options (autre) ------------------------------------------------------
  addOption() {
    this.services.autre.fr.push(['Nouvelle option', '']);
    this.services.autre.en.push(['New option', '']);
  }

  removeOption(i: number) {
    this.services.autre.fr.splice(i, 1);
    this.services.autre.en.splice(i, 1);
  }

  // ---- Textes (conditions) — propres a chaque langue ------------------------
  addtxt() {
    this.textes[this.lang].push('');
  }

  deltxt(i: number) {
    this.textes[this.lang].splice(i, 1);
  }

  movetxt(i: number, dir: number) {
    const a = this.textes[this.lang];
    const j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
  }

  trackByIndex(index: number) {
    return index;
  }

  // ---------------------------------------------------------------------------
  //  Export PDF / JPG (inchange)
  // ---------------------------------------------------------------------------
  generatePDFfromHTML() {
    const element = document.getElementById('htmlContent');

    html2canvas(element!, { scale: 4, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // Largeur en mm pour A4
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(
        'Plaquette Tarifaire 2025 ' + (this.lang == 'fr' ? 'FR' : 'EN') + '.pdf'
      );
    });
  }

  generatePDFfromHTMLPaysage() {
    const element = document.getElementById('htmlContent');

    html2canvas(element!, { scale: 4, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg');
      const pdf = new jsPDF('l', 'mm', 'a4');

      const imgWidth = 297; // Largeur en mm pour A4 paysage
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(
        'Plaquette Tarifaire 2025 ' + (this.lang == 'fr' ? 'FR' : 'EN') + '.pdf'
      );
    });
  }

  generateJPGfromHTML() {
    const element = document.getElementById('htmlContent');

    html2canvas(element!, { scale: 4, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      const link = document.createElement('a');
      link.href = imgData;
      link.download =
        'Plaquette Tarifaire 2025 ' + (this.lang == 'fr' ? 'FR' : 'EN') + '.jpg';
      link.click();
    });
  }
}

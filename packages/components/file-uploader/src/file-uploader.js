import { TSElement } from '@tradeshift/elements';
import css from './file-uploader.css';

import { defaultState } from './states/default.js';
import { uploadingState } from './states/uploading.js';
import { uploadFile } from './utils/uploadFile.js';

const [
  $template,
  $state,
  $endpoint,
  $filetypes
] = [
  Symbol('template'),
  Symbol('state'),
  Symbol('endpoint'),
  Symbol('filetypes')
];

class FileUploader extends TSElement('FileUploader') {
  static get observedAttributes() {
    return ['state', 'endpoint', 'filetypes'];
  }
  constructor() {
    super();
    this.filetypes = this.getAttribute('filetypes');    

    this.styles(css);
    this.template(`
    <div class="file-upload-wrapper">
      ${defaultState(this.filetypes)}
    </div>
    <div class="file-card-wrapper"></div>`,
      $template);

    this.fileType;
    this.formData = new FormData();
    this.state = this.getAttribute('state');
    this.endpoint = this.getAttribute('endpoint');
    this.handleClose = this.handleClose.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.resetFileInfo = this.resetFileInfo.bind(this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    // attach event listener when component first loads, otherwise, attach it in the handleClose fn
    if (newValue === 'upload' && oldValue === null) {
      this.shadowRoot.querySelector('input').addEventListener('change', this.handleUpload);
    }

    if (newValue === 'uploading') {
      this.shadowRoot.querySelector('.file-card-wrapper').addEventListener('click', this.handleClose);
    }
  }
  get state() {
    return this[$state];
  }
  set state(state) {
    if (state === this[$state]) {
      return;
    }

    this[$state] = state;
    this[state ? 'setAttribute' : 'removeAttribute']('state', state);
  }
  get endpoint() {
    return this[$endpoint];
  }
  set endpoint(endpoint) {
    if (endpoint === this[$endpoint]) {
      return;
    }

    this[$endpoint] = endpoint;
    this[endpoint ? 'setAttribute' : 'removeAttribute']('endpoint', endpoint);
  }
  get filetypes() {
    return this[$filetypes];
  }
  set filetypes(filetypes) {
    if (filetypes === this[$filetypes]) {
      return;
    }

    this[$filetypes] = filetypes;
    this[filetypes ? 'setAttribute' : 'removeAttribute']('filetypes', filetypes);
  }
  handleUpload(e) {
    const $fileCard = this.shadowRoot.querySelector('.file-card-wrapper');
    this.state = 'uploading';

    const uploading = e.type === 'change';
    let file;

    if (uploading) {
      file = e.target.files[0];
      $fileCard.innerHTML = uploadingState(file.name);
      this.formData.append('file', file);
    } else {
      file = this.formData.get('file');
      $fileCard.innerHTML = uploadingState(file.name);
    }

    uploadFile(this, $fileCard, file);
  }
  handleClose(e) {
    if (e.target.classList.contains('file-card--close')) {
      this.state = 'upload';
      this.shadowRoot.querySelector('.file-card-wrapper').innerHTML = '';
      this.shadowRoot.querySelector('input').addEventListener('change', this.handleUpload);
      this.formData.delete('file');
    }
  }
  handleDownload() {
    this.fileType = this.shadowRoot.querySelector('.filetype').innerHTML;
    this.shadowRoot.querySelector('.filetype').innerHTML = '<small class="message">Click to download</span>';
  }
  resetFileInfo() {
    this.shadowRoot.querySelector('.filetype').innerHTML = this.fileType;
  }
}

customElements.define('ts-file-uploader', FileUploader);
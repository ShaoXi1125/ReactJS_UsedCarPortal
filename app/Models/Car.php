<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    const STATUS_AVAILABLE = 'AVAILABLE';
    const STATUS_RESERVED = 'RESERVED';
    const STATUS_SOLD = 'SOLD';
    
    protected $fillable = [
        'user_id',
        'make_id',
        'model_id',
        'variant_id',
        'color',
        'year',
        'mileage',
        'price',
        'description',
        'status'
    ];
    

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function make()
    {
        return $this->belongsTo(Make::class);
    }

    public function model()
    {
        return $this->belongsTo(CarModel::class);
    }

    public function variant()
    {
        return $this->belongsTo(Variant::class);
    }

    public function images()
    {
        return $this->hasMany(CarImage::class);
    }

    


}

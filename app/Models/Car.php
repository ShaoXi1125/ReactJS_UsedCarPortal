<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    //
    protected $fillable = [
        'user_id',
        'make_id',
        'model_id',
        'variant_id',
        'color',
        'year',
        'mileage',
        'price',
        'description'
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
